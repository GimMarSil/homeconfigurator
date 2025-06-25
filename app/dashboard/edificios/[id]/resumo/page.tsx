"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, BarChart3 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useData } from "@/hooks/use-data"

export default function EdificioResumoPage() {
  const params = useParams()
  const router = useRouter()
  const edificioId = Number.parseInt(params.id as string)

  const { getEdificioById, getClienteById, getZonaTipoById, getTipoMaterialById, getMaterialById } = useData()

  const edificio = getEdificioById(edificioId)
  const cliente = edificio ? getClienteById(edificio.clienteId) : null

  if (!edificio || !cliente) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Edifício não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/edificios")} className="mt-4">
            Voltar aos Edifícios
          </Button>
        </div>
      </div>
    )
  }

  // Calcular totais
  const calcularTotais = () => {
    let totalGeral = 0
    const totaisPorZona: { [key: number]: number } = {}

    edificio.zonas.forEach((zona) => {
      let totalZona = 0
      zona.materiaisSelecionados.forEach((materialSel) => {
        const subtotal = materialSel.quantidade * materialSel.precoUnitario
        totalZona += subtotal
        totalGeral += subtotal
      })
      totaisPorZona[zona.id] = totalZona
    })

    return { totalGeral, totaisPorZona }
  }

  const { totalGeral, totaisPorZona } = calcularTotais()

  const handleExportExcel = () => {
    // Simular export para Excel
    alert("Funcionalidade de export para Excel será implementada")
  }

  const handleExportPDF = () => {
    // Simular export para PDF
    alert("Funcionalidade de export para PDF será implementada")
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/clientes">Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/clientes/${cliente.id}`}>{cliente.nome}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/edificios/${edificio.id}`}>{edificio.nome}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Comparação e Resumo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Comparação e Resumo de Projeto</h2>
          <p className="text-gray-600">
            {edificio.nome} • {cliente.nome}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">€{totalGeral.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Geral</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{edificio.zonas.length}</div>
              <div className="text-sm text-gray-600">Zonas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {edificio.zonas.reduce((total, zona) => total + zona.materiaisSelecionados.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Materiais</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">€{(totalGeral / edificio.areaBruta).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Por m²</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Simulado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Custo por Zona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {edificio.zonas.map((zona) => {
              const zonaTipo = getZonaTipoById(zona.zonaTipoId)
              const totalZona = totaisPorZona[zona.id] || 0
              const percentagem = totalGeral > 0 ? (totalZona / totalGeral) * 100 : 0

              return (
                <div key={zona.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{zona.nome}</span>
                      <span className="text-sm text-gray-500 ml-2">({zonaTipo?.nome})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{totalZona.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{percentagem.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentagem}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela Resumo Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zona</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Área (m²)</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead className="text-right">Preço Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {edificio.zonas.map((zona) => {
                const zonaTipo = getZonaTipoById(zona.zonaTipoId)

                return zona.materiaisSelecionados.map((materialSel, index) => {
                  const material = getMaterialById(materialSel.materialId)
                  const tipoMaterial = material ? getTipoMaterialById(material.tipoMaterialId) : null
                  const subtotal = materialSel.quantidade * materialSel.precoUnitario

                  return (
                    <TableRow key={`${zona.id}-${materialSel.id}`}>
                      {index === 0 ? (
                        <>
                          <TableCell rowSpan={zona.materiaisSelecionados.length} className="font-medium">
                            {zona.nome}
                          </TableCell>
                          <TableCell rowSpan={zona.materiaisSelecionados.length}>
                            <Badge variant="outline">{zonaTipo?.categoria}</Badge>
                          </TableCell>
                          <TableCell rowSpan={zona.materiaisSelecionados.length}>{zona.area}</TableCell>
                        </>
                      ) : null}
                      <TableCell>
                        <div>
                          <div className="font-medium">{material?.nome}</div>
                          <div className="text-sm text-gray-500">
                            {material?.marca} • {material?.referencia}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {materialSel.quantidade} {tipoMaterial?.unidadeMedida}
                      </TableCell>
                      <TableCell>€{materialSel.precoUnitario.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">€{subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })
              })}
              <TableRow className="bg-gray-50 font-medium">
                <TableCell colSpan={6} className="text-right">
                  <strong>Total Geral:</strong>
                </TableCell>
                <TableCell className="text-right">
                  <strong>€{totalGeral.toFixed(2)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
