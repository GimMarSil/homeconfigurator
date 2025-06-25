"use client"

import { useState, useEffect, useCallback } from "react"
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/auth-context'
import { useRouter } from 'next/navigation'
import { apiClient, ApiResponse } from '../lib/api-client'
import { config } from '../lib/config'

// Interfaces baseadas no Prisma
export interface Cliente {
  id: number
  nome: string
  email: string
  telefone?: string
  morada?: string
  nif?: string
  status: "ATIVO" | "INATIVO"
  criadoEm: string
  atualizadoEm: string
  utilizadores: Utilizador[]
  edificios: Edificio[]
}

export interface Utilizador {
  id: number
  nome: string
  email: string
  telefone?: string
  role: "ADMIN" | "GESTOR" | "VISUALIZADOR"
  status: "ATIVO" | "INATIVO"
  ultimoAcesso?: string
  clienteId?: number
}

export interface Edificio {
  id: number
  nome: string
  morada: string
  tipologia?: string
  nPisos?: number
  areaBruta?: number
  anoConstrucao?: number
  plantaImagem?: string
  estado: "EM_CURSO" | "FINALIZADO" | "PAUSADO"
  clienteId: number
  cliente?: {
    id: number
    nome: string
    email: string
  }
  zonasEspecificas?: ZonaEspecifica[]
}

export interface ZonaTipo {
  id: number
  nome: string
  categoria: "HABITACIONAL" | "TECNICO" | "EXTERIOR" | "CIRCULACAO" | "SERVICOS"
  descricao?: string
  materiaisPermitidos?: ZonaTipoMaterial[]
}

export interface ZonaEspecifica {
  id: number
  nome: string
  area: number
  estado: "PENDENTE" | "EM_PROGRESSO" | "CONCLUIDO"
  zonaTipoId: number
  edificioId: number
  zonaTipo?: ZonaTipo
  edificio?: Edificio
  materiaisSelecionados?: MaterialSelecionado[]
}

export interface MaterialSelecionado {
  id: number
  quantidade: number
  precoUnitario: number
  observacoes?: string
  materialId: number
  zonaId: number
  material?: Material
}

export interface ZonaTipoMaterial {
  id: number
  zonaTipoId: number
  materialId: number
  material?: Material
}

export interface Material {
  id: number
  nome: string
  referencia?: string
  marca?: string
  descricao?: string
  precoUnitario: number
  fornecedor?: string
  imagem?: string
  fichaTecnica?: string
  disponivel: boolean
  tipoMaterial: TipoMaterial
}

export interface TipoMaterial {
  id: number
  nome: string
  categoria: string
  unidadeMedida: string
  descricao?: string
}

export function useApiData() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [zonas, setZonas] = useState<ZonaEspecifica[]>([])
  const [tiposMaterial, setTiposMaterial] = useState<TipoMaterial[]>([])
  const [zonasTipo, setZonasTipo] = useState<ZonaTipo[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  // Verificar status da rede/API
  const checkNetworkStatus = useCallback(async () => {
    try {
      const isHealthy = await apiClient.healthCheck()
      setNetworkStatus(isHealthy ? 'online' : 'offline')
      return isHealthy
    } catch {
      setNetworkStatus('offline')
      return false
    }
  }, [])

  // Função para manuseamento de erros de autenticação
  const handleAuthError = useCallback(() => {
    console.warn('Erro de autenticação detectado. A fazer logout automático...')
    toast.error('Sessão expirada. A redirecionar para o login...')
    
    logout()
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }, [logout, router])

  // Função genérica para tratar respostas da API
  const handleApiResponse = useCallback(<T,>(
    response: ApiResponse<T>,
    successMessage?: string,
    showErrorToast = true
  ): T | null => {
    if (response.success && response.data) {
      if (successMessage) {
        toast.success(successMessage)
      }
      return response.data
    }

    // Tratar erros
    const errorMessage = response.error || 'Erro desconhecido'
    
    if (errorMessage.includes('401') || errorMessage.includes('Token inválido') || errorMessage.includes('Sessão expirada')) {
      handleAuthError()
      return null
    }

    if (errorMessage.includes('Timeout') || errorMessage.includes('fetch')) {
      setNetworkStatus('offline')
      if (showErrorToast) {
        toast.error('Problema de conexão. Verifique a sua ligação à internet.')
      }
    } else if (showErrorToast && !errorMessage.includes('autenticado')) {
      toast.error(errorMessage)
    }

    setError(errorMessage)
    return null
  }, [handleAuthError])

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    if (authLoading || !user) {
      return
    }

    setIsLoading(true)
    setError(null)

    // Verificar conectividade primeiro
    const isOnline = await checkNetworkStatus()
    if (!isOnline) {
      setError('Sem conexão com o servidor')
      setIsLoading(false)
      return
    }

    try {
      if (config.debug.enabled) {
        console.log('🔄 Carregando dados iniciais...')
      }

      // Carregar clientes
      const clientesResponse = await apiClient.get<Cliente[]>('/api/clientes')
      const clientesData = handleApiResponse(clientesResponse, undefined, false)
      
      if (clientesData) {
        setClientes(clientesData)
      }

      // Carregar utilizadores
      const utilizadoresResponse = await apiClient.get<Utilizador[]>('/api/utilizadores')
      const utilizadoresData = handleApiResponse(utilizadoresResponse, undefined, false)
      
      if (utilizadoresData) {
        setUtilizadores(utilizadoresData)
      }

      // Carregar edifícios
      const edificiosResponse = await apiClient.get<Edificio[]>('/api/edificios')
      const edificiosData = handleApiResponse(edificiosResponse, undefined, false)
      
      if (edificiosData) {
        setEdificios(edificiosData)
      }

      // Carregar tipos de material
      const tiposMaterialResponse = await apiClient.get<TipoMaterial[]>('/api/tipos-material')
      const tiposMaterialData = handleApiResponse(tiposMaterialResponse, undefined, false)
      
      if (tiposMaterialData) {
        setTiposMaterial(tiposMaterialData)
      }

      // Carregar tipos de zona
      const zonasTipoResponse = await apiClient.get<ZonaTipo[]>('/api/zonas-tipo')
      const zonasTipoData = handleApiResponse(zonasTipoResponse, undefined, false)
      
      if (zonasTipoData) {
        setZonasTipo(zonasTipoData)
      }

      // Carregar materiais
      const materiaisResponse = await apiClient.get<Material[]>('/api/materiais')
      const materiaisData = handleApiResponse(materiaisResponse, undefined, false)
      
      if (materiaisData) {
        setMateriais(materiaisData)
      }

      // Carregar zonas
      const zonasResponse = await apiClient.get<ZonaEspecifica[]>('/api/zonas')
      const zonasData = handleApiResponse(zonasResponse, undefined, false)
      
      if (zonasData) {
        setZonas(zonasData)
      }

      setIsLoaded(true)
      
      if (config.debug.enabled) {
        console.log('✅ Dados carregados com sucesso:', {
          clientes: clientesData?.length || 0,
          utilizadores: utilizadoresData?.length || 0,
          edificios: edificiosData?.length || 0,
          materiais: materiaisData?.length || 0,
          zonas: zonasData?.length || 0,
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao carregar dados:', error)
      setError(errorMessage)
      setNetworkStatus('offline')
    } finally {
      setIsLoading(false)
    }
  }, [user, authLoading, checkNetworkStatus, handleApiResponse])

  // Buscar edifícios por cliente
  const fetchEdificios = useCallback(async (clienteId?: number) => {
    if (!user) return

    const endpoint = clienteId ? `/api/edificios?clienteId=${clienteId}` : '/api/edificios'
    const response = await apiClient.get<Edificio[]>(endpoint)
    const data = handleApiResponse(response, undefined, false)
    
    if (data) {
      setEdificios(data)
    }
  }, [user, handleApiResponse])

  // Buscar zonas por edifício
  const fetchZonas = useCallback(async (edificioId?: number) => {
    if (!user) return

    const endpoint = edificioId ? `/api/zonas?edificioId=${edificioId}` : '/api/zonas'
    const response = await apiClient.get<ZonaEspecifica[]>(endpoint)
    const data = handleApiResponse(response, undefined, false)
    
    if (data) {
      setZonas(data)
    }
  }, [user, handleApiResponse])

  // Buscar detalhes da zona com materiais
  const fetchZonaMateriais = useCallback(async (zonaId: number) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.get<any>(`/api/zonas/${zonaId}`)
    const zona = handleApiResponse(response, undefined, false)
    
    if (!zona) {
      throw new Error('Erro ao carregar dados da zona')
    }

    // Return data in the format expected by the page
    return { zona }
  }, [user, handleApiResponse])

  // Update zona
  const updateZona = useCallback(async (id: number, zonaData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.put<any>(`/api/zonas/${id}`, zonaData)
    const zonaAtualizada = handleApiResponse(response, 'Zona atualizada com sucesso!')

    if (zonaAtualizada) {
      // Update local state
      setZonas(prev => prev.map(z => z.id === id ? { ...z, ...zonaData } : z))
      return zonaAtualizada
    }

    throw new Error(response.error || 'Erro ao atualizar zona')
  }, [user, handleApiResponse])

  // Add zona
  const addZona = useCallback(async (zonaData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.post<ZonaEspecifica>('/api/zonas', zonaData)
    const novaZona = handleApiResponse(response, 'Zona criada com sucesso!')

    if (novaZona) {
      setZonas(prev => [...prev, novaZona])
      return novaZona
    }

    throw new Error(response.error || 'Erro ao criar zona')
  }, [user, handleApiResponse])

  // Carregar dados na inicialização
  useEffect(() => {
    loadData()
  }, [loadData])

  // CRUD Clientes
  const addCliente = useCallback(async (clienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm' | 'utilizadores' | 'edificios'>) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.post<Cliente>('/api/clientes', clienteData)
    const novoCliente = handleApiResponse(response, 'Cliente criado com sucesso!')

    if (novoCliente) {
      setClientes(prev => [...prev, novoCliente])
      return novoCliente
    }

    throw new Error(response.error || 'Erro ao criar cliente')
  }, [user, handleApiResponse])

  const updateCliente = useCallback(async (id: number, clienteData: Partial<Cliente>) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.put<Cliente>(`/api/clientes/${id}`, clienteData)
    const clienteAtualizado = handleApiResponse(response, 'Cliente atualizado com sucesso!')

    if (clienteAtualizado) {
      setClientes(prev => prev.map(c => c.id === id ? clienteAtualizado : c))
      return clienteAtualizado
    }

    throw new Error(response.error || 'Erro ao atualizar cliente')
  }, [user, handleApiResponse])

  const deleteCliente = useCallback(async (id: number) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.delete(`/api/clientes/${id}`)
    
    if (response.success) {
      setClientes(prev => prev.filter(c => c.id !== id))
      toast.success('Cliente eliminado com sucesso!')
    } else {
      const errorMessage = response.error || 'Erro ao eliminar cliente'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user])

  // CRUD Materiais (similar pattern)
  const addMaterial = useCallback(async (materialData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.post<Material>('/api/materiais', materialData)
    const novoMaterial = handleApiResponse(response, 'Material criado com sucesso!')

    if (novoMaterial) {
      setMateriais(prev => [...prev, novoMaterial])
      return novoMaterial
    }

    throw new Error(response.error || 'Erro ao criar material')
  }, [user, handleApiResponse])

  const updateMaterial = useCallback(async (id: number, materialData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.put<Material>(`/api/materiais/${id}`, materialData)
    const materialAtualizado = handleApiResponse(response, 'Material atualizado com sucesso!')

    if (materialAtualizado) {
      setMateriais(prev => prev.map(m => m.id === id ? materialAtualizado : m))
      return materialAtualizado
    }

    throw new Error(response.error || 'Erro ao atualizar material')
  }, [user, handleApiResponse])

  const deleteMaterial = useCallback(async (id: number, options?: { force?: boolean; cascade?: boolean }) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    // Construir URL com parâmetros opcionais
    let url = `/api/materiais/${id}`
    const params = new URLSearchParams()
    
    if (options?.force) params.append('force', 'true')
    if (options?.cascade) params.append('cascade', 'true')
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await apiClient.delete(url)
    
    if (response.success) {
      setMateriais(prev => prev.filter(m => m.id !== id))
      
      // Mensagem específica baseada no tipo de eliminação
      if (options?.cascade) {
        toast.success('Material eliminado com sucesso em cascata!')
      } else if (options?.force) {
        toast.success('Material eliminado forçadamente!')
      } else {
        toast.success('Material eliminado com sucesso!')
      }
    } else {
      // Tratar erro de integridade referencial
      if (response.status === 409) {
        const errorDetails = response.error || 'Erro de integridade referencial'
        const suggestion = response.suggestion || 'Use as opções de eliminação forçada ou em cascata'
        
        // Mostrar toast com detalhes do erro
        toast.error(`${errorDetails}. ${suggestion}`)
        
        // Retornar erro estruturado para permitir tratamento específico no frontend
        throw new Error(JSON.stringify({
          type: 'REFERENTIAL_INTEGRITY',
          message: errorDetails,
          suggestion,
          details: response.details,
          relatedCounts: response.relatedCounts
        }))
      } else {
        const errorMessage = response.error || 'Erro ao eliminar material'
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
    }
  }, [user])

  // CRUD Edifícios
  const addEdificio = useCallback(async (edificioData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.post<Edificio>('/api/edificios', edificioData)
    const novoEdificio = handleApiResponse(response, 'Edifício criado com sucesso!')

    if (novoEdificio) {
      setEdificios(prev => [...prev, novoEdificio])
      return novoEdificio
    }

    throw new Error(response.error || 'Erro ao criar edifício')
  }, [user, handleApiResponse])

  const updateEdificio = useCallback(async (id: number, edificioData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.put<Edificio>(`/api/edificios/${id}`, edificioData)
    const edificioAtualizado = handleApiResponse(response, 'Edifício atualizado com sucesso!')

    if (edificioAtualizado) {
      setEdificios(prev => prev.map(e => e.id === id ? edificioAtualizado : e))
      return edificioAtualizado
    }

    throw new Error(response.error || 'Erro ao atualizar edifício')
  }, [user, handleApiResponse])

  const deleteEdificio = useCallback(async (id: number) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.delete(`/api/edificios/${id}`)
    
    if (response.success) {
      setEdificios(prev => prev.filter(e => e.id !== id))
      toast.success('Edifício eliminado com sucesso!')
    } else {
      const errorMessage = response.error || 'Erro ao eliminar edifício'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user])

  // CRUD Utilizadores  
  const addUtilizador = useCallback(async (utilizadorData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.post<Utilizador>('/api/utilizadores', utilizadorData)
    const novoUtilizador = handleApiResponse(response, 'Utilizador criado com sucesso!')

    if (novoUtilizador) {
      setUtilizadores(prev => [...prev, novoUtilizador])
      return novoUtilizador
    }

    throw new Error(response.error || 'Erro ao criar utilizador')
  }, [user, handleApiResponse])

  const updateUtilizador = useCallback(async (id: number, utilizadorData: any) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.put<Utilizador>(`/api/utilizadores/${id}`, utilizadorData)
    const utilizadorAtualizado = handleApiResponse(response, 'Utilizador atualizado com sucesso!')

    if (utilizadorAtualizado) {
      setUtilizadores(prev => prev.map(u => u.id === id ? utilizadorAtualizado : u))
      return utilizadorAtualizado
    }

    throw new Error(response.error || 'Erro ao atualizar utilizador')
  }, [user, handleApiResponse])

  const deleteUtilizador = useCallback(async (id: number) => {
    if (!user) {
      throw new Error('Utilizador não autenticado')
    }

    const response = await apiClient.delete(`/api/utilizadores/${id}`)
    
    if (response.success) {
      setUtilizadores(prev => prev.filter(u => u.id !== id))
      toast.success('Utilizador eliminado com sucesso!')
    } else {
      const errorMessage = response.error || 'Erro ao eliminar utilizador'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [user])

  // Funções auxiliares
  const getClienteById = useCallback((id: number) => clientes.find((c) => c.id === id), [clientes])
  const getUtilizadorById = useCallback((id: number) => utilizadores.find((u) => u.id === id), [utilizadores])
  const getEdificioById = useCallback((id: number) => edificios.find((e) => e.id === id), [edificios])
  const getZonaTipoById = useCallback((id: number) => zonasTipo.find((z) => z.id === id), [zonasTipo])
  const getTipoMaterialById = useCallback((id: number) => tiposMaterial.find((t) => t.id === id), [tiposMaterial])
  const getMaterialById = useCallback((id: number) => materiais.find((m) => m.id === id), [materiais])

  const getUtilizadoresByClienteId = useCallback((clienteId: number) => {
    return utilizadores.filter((u) => u.clienteId === clienteId)
  }, [utilizadores])

  const getEdificiosByClienteId = useCallback((clienteId: number) => {
    return edificios.filter((e) => e.clienteId === clienteId)
  }, [edificios])

  const getZonasByEdificioId = useCallback((edificioId: number) => {
    return zonas.filter((z) => z.edificioId === edificioId)
  }, [zonas])

  return {
    // Dados
    clientes,
    utilizadores,
    materiais,
    edificios,
    zonas,
    tiposMaterial,
    zonasTipo,
    
    // Estados
    isLoaded,
    isLoading,
    error,
    networkStatus,
    
    // Ações
    loadData,
    fetchEdificios,
    fetchZonas,
    fetchZonaMateriais,
    updateZona,
    addZona,
    addCliente,
    updateCliente,
    deleteCliente,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addEdificio,
    updateEdificio,
    deleteEdificio,
    addUtilizador,
    updateUtilizador,
    deleteUtilizador,
    
    // Funções helper
    getClienteById,
    getUtilizadorById,
    getEdificioById,
    getZonaTipoById,
    getTipoMaterialById,
    getMaterialById,
    getUtilizadoresByClienteId,
    getEdificiosByClienteId,
    getZonasByEdificioId,
    
    // Utilitários
    checkNetworkStatus,
  }
} 