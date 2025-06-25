"use client"

import { useState, useEffect } from "react"

export interface Cliente {
  id: number
  nome: string
  email: string
  telefone: string
  morada: string
  nif: string
  status: "Ativo" | "Inativo"
  utilizadores: Utilizador[]
}

export interface Utilizador {
  id: number
  nome: string
  email: string
  telefone: string
  password: string
  role: "admin" | "gestor" | "visualizador"
  status: "Ativo" | "Inativo"
  clienteId: number
  ultimoAcesso?: string
}

export interface Edificio {
  id: number
  nome: string
  morada: string
  tipologia: string
  nPisos: number
  areaBruta: number
  anoConstrucao: number
  plantaImagem?: string
  clienteId: number
  estado: "Em Curso" | "Finalizado" | "Pausado"
  dataCriacao: string
  zonas: ZonaEspecifica[]
}

export interface ZonaTipo {
  id: number
  nome: string
  categoria: "Habitacional" | "Técnico" | "Exterior" | "Circulação" | "Serviços"
  materiaisPermitidos: number[]
  descricao: string
}

export interface ZonaEspecifica {
  id: number
  nome: string
  zonaTipoId: number
  area: number
  edificioId: number
  materiaisSelecionados: MaterialSelecionado[]
  estado: "Pendente" | "Em Progresso" | "Concluído"
}

export interface MaterialSelecionado {
  id: number
  materialId: number
  quantidade: number
  precoUnitario: number
  observacoes?: string
}

export interface TipoMaterial {
  id: number
  nome: string
  categoria: string
  unidadeMedida: string
  descricao: string
}

export interface Material {
  id: number
  nome: string
  tipoMaterialId: number
  referencia: string
  marca: string
  descricao: string
  precoUnitario: number
  fornecedor: string
  urlFabricante?: string
  imagem?: string
  fichaTecnica?: string
  disponivel: boolean
}

export function useData() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [utilizadores, setUtilizadores] = useState<Utilizador[]>([])
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [zonasTipo, setZonasTipo] = useState<ZonaTipo[]>([])
  const [tiposMaterial, setTiposMaterial] = useState<TipoMaterial[]>([])
  const [materiais, setMateriais] = useState<Material[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Carregar dados do localStorage ou usar dados iniciais
    const savedClientes = localStorage.getItem("clientes")
    const savedUtilizadores = localStorage.getItem("utilizadores")
    const savedEdificios = localStorage.getItem("edificios")
    const savedZonasTipo = localStorage.getItem("zonasTipo")
    const savedTiposMaterial = localStorage.getItem("tiposMaterial")
    const savedMateriais = localStorage.getItem("materiais")

    setClientes(savedClientes ? JSON.parse(savedClientes) : [])
    setUtilizadores(savedUtilizadores ? JSON.parse(savedUtilizadores) : [])
    setEdificios(savedEdificios ? JSON.parse(savedEdificios) : [])
    setZonasTipo(savedZonasTipo ? JSON.parse(savedZonasTipo) : [])
    setTiposMaterial(savedTiposMaterial ? JSON.parse(savedTiposMaterial) : [])
    setMateriais(savedMateriais ? JSON.parse(savedMateriais) : [])

    setIsLoaded(true)
  }, [])

  // Funções para clientes
  const addCliente = (cliente: Omit<Cliente, "id" | "utilizadores">) => {
    const newCliente = {
      ...cliente,
      id: Math.max(...clientes.map((c) => c.id), 0) + 1,
      utilizadores: [],
    }
    const updatedClientes = [...clientes, newCliente]
    setClientes(updatedClientes)
    localStorage.setItem("clientes", JSON.stringify(updatedClientes))
  }

  const updateCliente = (id: number, cliente: Partial<Cliente>) => {
    const updatedClientes = clientes.map((c) => (c.id === id ? { ...c, ...cliente } : c))
    setClientes(updatedClientes)
    localStorage.setItem("clientes", JSON.stringify(updatedClientes))
  }

  const deleteCliente = (id: number) => {
    const updatedClientes = clientes.filter((c) => c.id !== id)
    setClientes(updatedClientes)
    localStorage.setItem("clientes", JSON.stringify(updatedClientes))

    // Remover utilizadores e edifícios associados
    const updatedUtilizadores = utilizadores.filter((u) => u.clienteId !== id)
    setUtilizadores(updatedUtilizadores)
    localStorage.setItem("utilizadores", JSON.stringify(updatedUtilizadores))

    const updatedEdificios = edificios.filter((e) => e.clienteId !== id)
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  // Funções para utilizadores
  const addUtilizador = (utilizador: Omit<Utilizador, "id">) => {
    const newUtilizador = {
      ...utilizador,
      id: Math.max(...utilizadores.map((u) => u.id), 0) + 1,
    }
    const updatedUtilizadores = [...utilizadores, newUtilizador]
    setUtilizadores(updatedUtilizadores)
    localStorage.setItem("utilizadores", JSON.stringify(updatedUtilizadores))
  }

  const updateUtilizador = (id: number, utilizador: Partial<Utilizador>) => {
    const updatedUtilizadores = utilizadores.map((u) => (u.id === id ? { ...u, ...utilizador } : u))
    setUtilizadores(updatedUtilizadores)
    localStorage.setItem("utilizadores", JSON.stringify(updatedUtilizadores))
  }

  const deleteUtilizador = (id: number) => {
    const updatedUtilizadores = utilizadores.filter((u) => u.id !== id)
    setUtilizadores(updatedUtilizadores)
    localStorage.setItem("utilizadores", JSON.stringify(updatedUtilizadores))
  }

  // Funções para edifícios
  const addEdificio = (edificio: Omit<Edificio, "id" | "zonas" | "dataCriacao">) => {
    const newEdificio = {
      ...edificio,
      id: Math.max(...edificios.map((e) => e.id), 0) + 1,
      zonas: [],
      dataCriacao: new Date().toISOString().split("T")[0],
    }
    const updatedEdificios = [...edificios, newEdificio]
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  const updateEdificio = (id: number, edificio: Partial<Edificio>) => {
    const updatedEdificios = edificios.map((e) => (e.id === id ? { ...e, ...edificio } : e))
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  const deleteEdificio = (id: number) => {
    const updatedEdificios = edificios.filter((e) => e.id !== id)
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  // Funções para zonas específicas
  const addZonaEspecifica = (edificioId: number, zona: Omit<ZonaEspecifica, "id">) => {
    const edificio = edificios.find((e) => e.id === edificioId)
    if (!edificio) return

    const allZonas = edificios.flatMap((e) => e.zonas)
    const newZona = {
      ...zona,
      id: Math.max(...allZonas.map((z) => z.id), 0) + 1,
    }

    const updatedEdificios = edificios.map((e) => (e.id === edificioId ? { ...e, zonas: [...e.zonas, newZona] } : e))
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  const updateZonaEspecifica = (edificioId: number, zonaId: number, zona: Partial<ZonaEspecifica>) => {
    const updatedEdificios = edificios.map((e) =>
      e.id === edificioId ? { ...e, zonas: e.zonas.map((z) => (z.id === zonaId ? { ...z, ...zona } : z)) } : e,
    )
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  const deleteZonaEspecifica = (edificioId: number, zonaId: number) => {
    const updatedEdificios = edificios.map((e) =>
      e.id === edificioId ? { ...e, zonas: e.zonas.filter((z) => z.id !== zonaId) } : e,
    )
    setEdificios(updatedEdificios)
    localStorage.setItem("edificios", JSON.stringify(updatedEdificios))
  }

  // Funções para materiais
  const addMaterial = (material: Omit<Material, "id">) => {
    const newMaterial = {
      ...material,
      id: Math.max(...materiais.map((m) => m.id), 0) + 1,
    }
    const updatedMateriais = [...materiais, newMaterial]
    setMateriais(updatedMateriais)
    localStorage.setItem("materiais", JSON.stringify(updatedMateriais))
  }

  const updateMaterial = (id: number, material: Partial<Material>) => {
    const updatedMateriais = materiais.map((m) => (m.id === id ? { ...m, ...material } : m))
    setMateriais(updatedMateriais)
    localStorage.setItem("materiais", JSON.stringify(updatedMateriais))
  }

  const deleteMaterial = (id: number) => {
    const updatedMateriais = materiais.filter((m) => m.id !== id)
    setMateriais(updatedMateriais)
    localStorage.setItem("materiais", JSON.stringify(updatedMateriais))
  }

  // Funções auxiliares
  const getClienteById = (id: number) => clientes.find((c) => c.id === id)
  const getUtilizadorById = (id: number) => utilizadores.find((u) => u.id === id)
  const getEdificioById = (id: number) => edificios.find((e) => e.id === id)
  const getZonaTipoById = (id: number) => zonasTipo.find((z) => z.id === id)
  const getTipoMaterialById = (id: number) => tiposMaterial.find((t) => t.id === id)
  const getMaterialById = (id: number) => materiais.find((m) => m.id === id)

  const getUtilizadoresByClienteId = (clienteId: number) => utilizadores.filter((u) => u.clienteId === clienteId)
  const getEdificiosByClienteId = (clienteId: number) => edificios.filter((e) => e.clienteId === clienteId)

  const getMateriaisPermitidosParaZona = (zonaTipoId: number) => {
    const zonaTipo = getZonaTipoById(zonaTipoId)
    if (!zonaTipo) return []
    return materiais.filter((m) => zonaTipo.materiaisPermitidos.includes(m.tipoMaterialId))
  }

  // Função para obter todas as zonas específicas
  const getAllZonasEspecificas = () => {
    return edificios.flatMap((edificio) =>
      edificio.zonas.map((zona) => ({
        ...zona,
        edificio: edificio,
        cliente: getClienteById(edificio.clienteId),
      })),
    )
  }

  return {
    clientes,
    utilizadores,
    edificios,
    zonasTipo,
    tiposMaterial,
    materiais,
    isLoaded,
    addCliente,
    updateCliente,
    deleteCliente,
    addUtilizador,
    updateUtilizador,
    deleteUtilizador,
    addEdificio,
    updateEdificio,
    deleteEdificio,
    addZonaEspecifica,
    updateZonaEspecifica,
    deleteZonaEspecifica,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getClienteById,
    getUtilizadorById,
    getEdificioById,
    getZonaTipoById,
    getTipoMaterialById,
    getMaterialById,
    getUtilizadoresByClienteId,
    getEdificiosByClienteId,
    getMateriaisPermitidosParaZona,
    getAllZonasEspecificas,
  }
}
