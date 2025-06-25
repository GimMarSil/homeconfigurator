'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  MoreVertical,
  Archive,
  Star,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Column {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | 'date' | 'email' | 'url'
  required?: boolean
  readonly?: boolean
  options?: { value: string; label: string }[]
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataManagementSystemProps {
  title: string
  description?: string
  apiEndpoint: string
  columns: Column[]
  bulkEndpoint?: string
  searchable?: string[]
  filterable?: string[]
  sortable?: string[]
  exportable?: boolean
  importable?: boolean
  permissions?: {
    create?: boolean
    edit?: boolean
    delete?: boolean
    bulk?: boolean
  }
  pageSize?: number
  className?: string
}

export function DataManagementSystem({
  title,
  description,
  apiEndpoint,
  columns,
  bulkEndpoint,
  searchable = [],
  filterable = [],
  sortable = [],
  exportable = true,
  importable = true,
  permissions = { create: true, edit: true, delete: true, bulk: true },
  pageSize = 50,
  className = ''
}: DataManagementSystemProps) {
  const { toast } = useToast()
  
  // Estados principais
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [bulkOperationResult, setBulkOperationResult] = useState<any>(null)
  
  // Estados de filtros e pesquisa
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Estados de modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newItem, setNewItem] = useState<any>({})

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(apiEndpoint)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(Array.isArray(result) ? result : result.data || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      toast({
        title: 'Erro ao carregar dados',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Dados filtrados e paginados
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Aplicar pesquisa
    if (searchTerm && searchable.length > 0) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        searchable.some(field => 
          String(item[field] || '').toLowerCase().includes(term)
        )
      )
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        filtered = filtered.filter(item => {
          if (typeof value === 'boolean') {
            return item[key] === value
          }
          return String(item[key] || '').toLowerCase().includes(String(value).toLowerCase())
        })
      }
    })

    // Aplicar ordenação
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, searchable, filters, sortConfig])

  // Paginação
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Manipulação de dados
  const handleCellEdit = (rowId: string, columnKey: string, value: any) => {
    setData(prev => prev.map(item => 
      item.id === rowId ? { ...item, [columnKey]: value, isModified: true } : item
    ))
  }

  const handleSort = (columnKey: string) => {
    if (!sortable.includes(columnKey)) return
    
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev?.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleRowSelect = (rowId: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(rowId)
      } else {
        newSet.delete(rowId)
      }
      return newSet
    })
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(paginatedData.map(item => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  // Operações CRUD
  const handleCreate = async () => {
    try {
      // Validar campos obrigatórios
      const requiredFields = columns.filter(col => col.required && !col.readonly)
      const missingFields = requiredFields.filter(col => !newItem[col.key] || String(newItem[col.key]).trim() === '')
      
      if (missingFields.length > 0) {
        toast({
          title: 'Campos obrigatórios',
          description: `Preencha os campos: ${missingFields.map(f => f.label).join(', ')}`,
          variant: 'destructive'
        })
        return
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newItem)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      await loadData()
      setShowCreateModal(false)
      setNewItem({})
      toast({
        title: 'Item criado com sucesso',
        description: 'O novo item foi adicionado à lista.',
      })
    } catch (err) {
      console.error('Erro ao criar item:', err)
      toast({
        title: 'Erro ao criar item',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    }
  }

  const handleBulkOperation = async () => {
    if (!bulkEndpoint) return

    try {
      const modifiedItems = data.filter(item => item.isModified || item.isNew || item.isDeleted)
      
      if (modifiedItems.length === 0) {
        toast({
          title: 'Nenhuma alteração',
          description: 'Não foram encontradas alterações para processar.',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch(bulkEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items: modifiedItems })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setBulkOperationResult(result)
      
      // Recarregar dados após operação bem-sucedida
      await loadData()
      setEditMode(false)
      setSelectedRows(new Set())
      
      toast({
        title: 'Operação concluída com sucesso',
        description: `${result.created || 0} criados, ${result.updated || 0} atualizados, ${result.deleted || 0} eliminados`,
      })

      // Limpar resultado após alguns segundos
      setTimeout(() => setBulkOperationResult(null), 5000)
      
    } catch (err) {
      console.error('Erro na operação em massa:', err)
      toast({
        title: 'Erro na operação em massa',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    }
  }

  const handleExport = () => {
    const csv = [
      columns.map(col => col.label).join(','),
      ...processedData.map(row => 
        columns.map(col => {
          const value = row[col.key]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || ''
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Renderizar célula editável
  const renderEditableCell = (item: any, column: Column) => {
    if (column.readonly || !editMode) {
      if (column.render) {
        return column.render(item[column.key], item)
      }
      
      if (column.type === 'select' && column.options) {
        const option = column.options.find(opt => opt.value === item[column.key])
        return option ? option.label : (item[column.key] || '-')
      }
      
      return item[column.key] || '-'
    }

    const value = item[column.key] || ''

    switch (column.type) {
      case 'select':
        // Verificar se o valor atual é válido, senão usar string vazia
        const validOptions = column.options?.filter(option => option.value && option.value !== '') || []
        const currentValue = validOptions.find(opt => opt.value === value)?.value || ''
        
        return (
          <Select
            value={currentValue}
            onValueChange={(newValue) => handleCellEdit(item.id, column.key, newValue)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent>
              {validOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'boolean':
        return (
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleCellEdit(item.id, column.key, checked)}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            value={value.toString()}
            onChange={(e) => handleCellEdit(item.id, column.key, e.target.value)}
            className="min-h-[60px] resize-none"
            placeholder={column.required ? `${column.label} (obrigatório)` : `Digite ${column.label.toLowerCase()}`}
          />
        )
      
      case 'number':
        return (
          <Input
            value={value.toString()}
            onChange={(e) => handleCellEdit(item.id, column.key, parseFloat(e.target.value) || 0)}
            type="number"
            className="h-8"
            placeholder={column.required ? `${column.label} (obrigatório)` : column.label}
          />
        )
      
      default:
        return (
          <Input
            value={value.toString()}
            onChange={(e) => handleCellEdit(item.id, column.key, e.target.value)}
            type="text"
            className={`h-8 ${column.required && !value ? 'border-red-300' : ''}`}
            placeholder={column.required ? `${column.label} (obrigatório)` : column.label}
          />
        )
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>A carregar dados...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {processedData.length} {processedData.length === 1 ? 'item' : 'itens'}
              </Badge>
              {selectedRows.size > 0 && (
                <Badge variant="secondary">
                  {selectedRows.size} selecionados
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {/* Barra de ferramentas */}
        <CardContent className="border-t">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Pesquisa */}
            {searchable.length > 0 && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex items-center gap-2">
              {permissions.create && (
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Criar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar novo item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {columns.filter(col => !col.readonly).map(column => (
                        <div key={column.key}>
                          <label className="text-sm font-medium">{column.label}</label>
                          {column.type === 'select' ? (
                            <Select
                              value={newItem[column.key] || ''}
                              onValueChange={(value) => setNewItem(prev => ({ ...prev, [column.key]: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Selecionar ${column.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {(column.options?.filter(option => option.value && option.value !== '') || []).map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={newItem[column.key] || ''}
                              onChange={(e) => setNewItem(prev => ({ ...prev, [column.key]: e.target.value }))}
                              type={column.type === 'number' ? 'number' : 'text'}
                              required={column.required}
                            />
                          )}
                        </div>
                      ))}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreate}>
                          Criar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {permissions.bulk && bulkEndpoint && (
                <Button
                  variant={editMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {editMode ? 'Sair da edição' : 'Edição em massa'}
                </Button>
              )}

              {exportable && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros */}
          {filterable.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {filterable.map(field => {
                const column = columns.find(col => col.key === field)
                if (!column) return null

                return (
                  <div key={field} className="flex items-center gap-2">
                    <label className="text-sm font-medium">{column.label}:</label>
                    {column.type === 'select' && column.options ? (
                      <Select
                        value={filters[field] || ''}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, [field]: value }))}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {column.options?.filter(option => option.value && option.value !== '').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={`Filtrar por ${column.label.toLowerCase()}`}
                        value={filters[field] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-[150px]"
                      />
                    )}
                  </div>
                )
              })}
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({})}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          )}

          {/* Ações em massa */}
          {editMode && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Modo de edição ativo</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" onClick={handleBulkOperation}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aplicar alterações
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {editMode && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  {columns.map(column => (
                    <TableHead
                      key={column.key}
                      className={`${column.width || ''} ${sortable.includes(column.key) ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {sortConfig?.key === column.key && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map(item => (
                  <TableRow key={item.id} className={item.isModified ? 'bg-yellow-50' : ''}>
                    {editMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(item.id)}
                          onCheckedChange={(checked) => handleRowSelect(item.id, checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={column.key}>
                        {renderEditableCell(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} 
                ({processedData.length} {processedData.length === 1 ? 'item' : 'itens'})
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado vazio */}
      {processedData.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'Nenhum item encontrado com os filtros aplicados.'
                : 'Nenhum item encontrado.'
              }
            </div>
            {permissions.create && (
              <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado da operação em massa */}
      {bulkOperationResult && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            Operação concluída: {bulkOperationResult.created} criados, {bulkOperationResult.updated} atualizados, {bulkOperationResult.deleted} eliminados.
            {bulkOperationResult.errors?.length > 0 && (
              <div className="mt-2">
                <strong>Erros:</strong>
                <ul className="list-disc list-inside">
                  {bulkOperationResult.errors.map((error: string, index: number) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Alias para compatibilidade
export const ConfigurableDataTable = DataManagementSystem