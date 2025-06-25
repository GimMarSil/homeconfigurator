"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Save, Plus, Trash2, Edit3, X, Check, AlertTriangle, Download, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkEditItem {
  id?: number
  nome: string
  unidadeMedida?: string
  descricao?: string
  isNew?: boolean
  isModified?: boolean
  isDeleted?: boolean
  hasConstraints?: boolean
  constraintCount?: number
}

interface BulkEditTableProps {
  title: string
  description: string
  items: BulkEditItem[]
  columns: {
    key: keyof BulkEditItem
    label: string
    required?: boolean
    placeholder?: string
  }[]
  onSave: (items: BulkEditItem[]) => Promise<void>
  onDelete: (id: number) => Promise<void>
  isLoading?: boolean
}

export function BulkEditTable({ title, description, items, columns, onSave, onDelete, isLoading }: BulkEditTableProps) {
  const [editingItems, setEditingItems] = useState<BulkEditItem[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const { toast } = useToast()
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (items && Array.isArray(items)) {
      setEditingItems(items.map(item => ({ ...item })))
    } else {
      setEditingItems([])
    }
  }, [items])

  useEffect(() => {
    const hasModifications = editingItems.some(item => 
      item.isNew || item.isModified || item.isDeleted
    )
    setHasChanges(hasModifications)
  }, [editingItems])

  const updateItem = (index: number, field: keyof BulkEditItem, value: string) => {
    setEditingItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { 
          ...item, 
          [field]: value,
          isModified: !item.isNew
        }
        return updated
      }
      return item
    }))
  }

  const addNewRow = () => {
    const newItem: BulkEditItem = {
      nome: "",
      unidadeMedida: "",
      descricao: "",
      isNew: true
    }
    setEditingItems(prev => [...prev, newItem])
  }

  const markForDeletion = (index: number) => {
    const item = editingItems[index]
    
    if (item.hasConstraints && item.constraintCount && item.constraintCount > 0) {
      toast({
        title: "Não é possível eliminar",
        description: `Este item está a ser usado por ${item.constraintCount} registo(s). Remova primeiro essas associações.`,
        variant: "destructive",
      })
      return
    }

    if (item.isNew) {
      // Se é novo, apenas remover da lista
      setEditingItems(prev => prev.filter((_, i) => i !== index))
    } else {
      // Se existe na BD, marcar para eliminação
      setEditingItems(prev => prev.map((item, i) => 
        i === index ? { ...item, isDeleted: !item.isDeleted } : item
      ))
    }
  }

  const handleSave = async () => {
    try {
      // Validar campos obrigatórios
      const invalidItems = editingItems.filter(item => {
        if (item.isDeleted) return false
        return columns.some(col => col.required && !item[col.key])
      })

      if (invalidItems.length > 0) {
        toast({
          title: "Erro de validação",
          description: "Preencha todos os campos obrigatórios antes de guardar.",
          variant: "destructive",
        })
        return
      }

      await onSave(editingItems)
      
      toast({
        title: "Sucesso",
        description: "Alterações guardadas com sucesso!",
      })
      
      setIsBulkMode(false)
    } catch (error) {
      console.error('Erro ao guardar:', error)
    }
  }

  const handleCancel = () => {
    setEditingItems(items.map(item => ({ ...item })))
    setIsBulkMode(false)
  }

  const exportToCsv = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = editingItems
      .filter(item => !item.isDeleted)
      .map(item => columns.map(col => `"${item[col.key] || ''}"`).join(','))
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast({
          title: "Erro",
          description: "O ficheiro CSV deve ter pelo menos uma linha de cabeçalho e uma linha de dados.",
          variant: "destructive",
        })
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const expectedHeaders = columns.map(col => col.label)
      
      // Verificar se os cabeçalhos correspondem
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        toast({
          title: "Erro de formato",
          description: `Cabeçalhos em falta: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        })
        return
      }

      // Mapear os índices dos cabeçalhos
      const headerMap = columns.reduce((acc, col) => {
        const index = headers.indexOf(col.label)
        if (index !== -1) {
          acc[col.key] = index
        }
        return acc
      }, {} as Record<string, number>)

      // Processar as linhas de dados
      const newItems = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const item: BulkEditItem = {
          nome: "",
          isNew: true
        }

        columns.forEach(col => {
          const valueIndex = headerMap[col.key]
          if (valueIndex !== undefined && values[valueIndex]) {
            item[col.key] = values[valueIndex] as any
          }
        })

        return item
      }).filter(item => item.nome) // Só adicionar itens com nome

      if (newItems.length === 0) {
        toast({
          title: "Nenhum dado válido",
          description: "Não foram encontrados dados válidos no ficheiro CSV.",
          variant: "destructive",
        })
        return
      }

      // Adicionar os novos itens à lista
      setEditingItems(prev => [...prev, ...newItems])
      setIsBulkMode(true)
      
      toast({
        title: "CSV importado",
        description: `${newItems.length} item(s) adicionado(s) para edição.`,
      })
    }

    reader.readAsText(file)
    // Limpar o input para permitir reimportação do mesmo ficheiro
    event.target.value = ''
  }

  const renderEditableCell = (item: BulkEditItem, column: typeof columns[0], index: number) => {
    const value = (item[column.key] as string) || ""
    
    if (!isBulkMode) {
      return (
        <span className={cn(
          "block w-full",
          item.isDeleted && "line-through text-muted-foreground"
        )}>
          {value || '-'}
        </span>
      )
    }

    return (
      <Input
        value={value}
        onChange={(e) => updateItem(index, column.key, e.target.value)}
        placeholder={column.placeholder}
        className={cn(
          "border-0 bg-transparent p-1 h-8 focus:bg-white focus:border",
          column.required && !value && "border-red-200 bg-red-50",
          item.isDeleted && "line-through text-muted-foreground bg-red-50"
        )}
        disabled={item.isDeleted}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {hasChanges && <Badge variant="outline" className="text-orange-600">Alterações pendentes</Badge>}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isBulkMode ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCsv}
                  disabled={editingItems.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  style={{ display: 'none' }}
                  id={`csv-upload-${title.replace(/\s+/g, '-')}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`csv-upload-${title.replace(/\s+/g, '-')}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkMode(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edição em Massa
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Todas
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isBulkMode && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Modo de edição em massa ativo.</strong> Clique nas células para editar. 
              Use Tab para navegar entre campos. As alterações só são guardadas quando clicar em "Guardar Todas".
            </AlertDescription>
          </Alert>
        )}
        
        <div ref={tableRef} className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead key={column.key} className="font-medium">
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </TableHead>
                ))}
                <TableHead className="w-12">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editingItems.map((item, index) => (
                <TableRow 
                  key={item.id || `new-${index}`}
                  className={cn(
                    "hover:bg-muted/30",
                    item.isNew && "bg-green-50",
                    item.isModified && "bg-blue-50",
                    item.isDeleted && "bg-red-50 opacity-60"
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="p-2">
                      {renderEditableCell(item, column, index)}
                    </TableCell>
                  ))}
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markForDeletion(index)}
                      className={cn(
                        "h-8 w-8 p-0",
                        item.isDeleted ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"
                      )}
                      title={item.isDeleted ? "Restaurar" : "Eliminar"}
                    >
                      {item.isDeleted ? <Check className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isBulkMode && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="p-2">
                    <Button
                      variant="dashed"
                      size="sm"
                      onClick={addNewRow}
                      className="w-full border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Nova Linha
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {editingItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-lg font-medium">Nenhum item encontrado</div>
            <div className="text-sm">Clique em "Edição em Massa" para adicionar novos itens</div>
          </div>
        )}

        {/* Legenda das cores */}
        {isBulkMode && (
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border rounded"></div>
              <span>Novo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border rounded"></div>
              <span>Modificado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border rounded"></div>
              <span>Para eliminar</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 