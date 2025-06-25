"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataManagementSystem } from '@/components/data-management-system'
import { ShieldCheck, Settings, Database, Zap, TrendingUp } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('tipos-material')

  // Configuração das colunas para tipos de material
  const tiposMaterialColumns = [
    {
      key: 'nome',
      label: 'Nome',
      type: 'text' as const,
      required: true,
      width: '200px'
    },
    {
      key: 'categoria',
      label: 'Categoria',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'ESTRUTURA', label: 'Estrutura' },
        { value: 'REVESTIMENTO', label: 'Revestimento' },
        { value: 'ISOLAMENTO', label: 'Isolamento' },
        { value: 'INSTALACOES', label: 'Instalações' },
        { value: 'ACABAMENTOS', label: 'Acabamentos' },
        { value: 'DECORACAO', label: 'Decoração' },
        { value: 'OUTROS', label: 'Outros' }
      ],
      width: '150px'
    },
    {
      key: 'unidadeMedida',
      label: 'Unidade',
      type: 'text' as const,
      required: true,
      width: '100px'
    },
    {
      key: 'descricao',
      label: 'Descrição',
      type: 'textarea' as const,
      width: '300px'
    }
  ]

  // Configuração das colunas para tipos de zona
  const tiposZonaColumns = [
    {
      key: 'nome',
      label: 'Nome',
      type: 'text' as const,
      required: true,
      width: '200px'
    },
    {
      key: 'categoria',
      label: 'Categoria',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'RESIDENCIAL', label: 'Residencial' },
        { value: 'COMERCIAL', label: 'Comercial' },
        { value: 'INDUSTRIAL', label: 'Industrial' },
        { value: 'PUBLICA', label: 'Pública' },
        { value: 'MISTA', label: 'Mista' }
      ],
      width: '150px'
    },
    {
      key: 'descricao',
      label: 'Descrição',
      type: 'textarea' as const,
      width: '300px'
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Configurações do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerir configurações globais, tipos de materiais e zonas com edição em massa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Sistema Ativo
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Edição Avançada
          </Badge>
        </div>
      </div>

      {/* Alerta sobre proteções automáticas */}
      <Alert className="border-blue-200 bg-blue-50">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Proteções Automáticas Ativas:</strong> O sistema implementa verificações de integridade 
          referencial automáticas. Tipos que estão a ser utilizados não podem ser eliminados e receberá 
          mensagens detalhadas com exemplos dos registos dependentes.
        </AlertDescription>
      </Alert>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos Material</p>
                <p className="text-lg font-bold">Gestão Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipos Zona</p>
                <p className="text-lg font-bold">Gestão Ativa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edição Massa</p>
                <p className="text-lg font-bold">Disponível</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proteções</p>
                <p className="text-lg font-bold">Automáticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tipos-material" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Tipos de Material
          </TabsTrigger>
          <TabsTrigger value="tipos-zona" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Tipos de Zona
          </TabsTrigger>
        </TabsList>

        {/* Tipos de Material */}
        <TabsContent value="tipos-material" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Gestão de Tipos de Material
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure os tipos de materiais disponíveis no sistema. Edição em massa, 
                exportação CSV, e verificações automáticas de integridade referencial.
              </p>
            </CardHeader>
            <CardContent>
              <DataManagementSystem
                title="Tipos de Material"
                description="Edite, adicione e remova tipos de material com proteções automáticas"
                apiEndpoint="/api/tipos-material"
                bulkEndpoint="/api/tipos-material/bulk"
                columns={tiposMaterialColumns}
                searchable={['nome', 'categoria', 'descricao']}
                filterable={['categoria']}
                sortable={['nome', 'categoria', 'unidadeMedida']}
                exportable={true}
                importable={true}
                permissions={{ 
                  create: true, 
                  edit: true, 
                  delete: true, 
                  bulk: true 
                }}
                pageSize={25}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tipos de Zona */}
        <TabsContent value="tipos-zona" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Gestão de Tipos de Zona
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Defina os tipos de zonas que podem ser criadas nos edifícios. O sistema mostrará 
                automaticamente quais zonas estão associadas antes de permitir eliminações.
              </p>
            </CardHeader>
            <CardContent>
              <DataManagementSystem
                title="Tipos de Zona"
                description="Edite, adicione e remova tipos de zona com verificações de dependências"
                apiEndpoint="/api/zonas-tipo"
                bulkEndpoint="/api/zonas-tipo/bulk"
                columns={tiposZonaColumns}
                searchable={['nome', 'categoria', 'descricao']}
                filterable={['categoria']}
                sortable={['nome', 'categoria']}
                exportable={true}
                importable={true}
                permissions={{ 
                  create: true, 
                  edit: true, 
                  delete: true, 
                  bulk: true 
                }}
                pageSize={25}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações sobre funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Funcionalidades Implementadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Edição em Massa Tipo Excel</p>
                <p className="text-sm text-muted-foreground">
                  Edite múltiplos registos simultaneamente com interface avançada
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Pesquisa e Filtros Avançados</p>
                <p className="text-sm text-muted-foreground">
                  Procure por qualquer campo e filtre por categoria
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Exportação e Importação CSV</p>
                <p className="text-sm text-muted-foreground">
                  Exporte dados e importe em massa via ficheiros CSV
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Ordenação Dinâmica</p>
                <p className="text-sm text-muted-foreground">
                  Ordene por qualquer coluna clicando no cabeçalho
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Proteções Automáticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Verificação Antes de Eliminar</p>
                <p className="text-sm text-muted-foreground">
                  Sistema verifica automaticamente dependências
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Mensagens Detalhadas</p>
                <p className="text-sm text-muted-foreground">
                  Explicações claras com exemplos dos registos afetados
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Prevenção de Inconsistências</p>
                <p className="text-sm text-muted-foreground">
                  Evita eliminações que quebrariam a integridade dos dados
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Validação em Tempo Real</p>
                <p className="text-sm text-muted-foreground">
                  Campos obrigatórios e tipos de dados validados automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 