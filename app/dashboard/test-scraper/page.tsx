'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TestScraperPage() {
  const [url, setUrl] = useState('https://productfinder.porcelanosagrupo.com/pt/mosaicos_e_decorados/metal_bronze_mini_3d_cubes_g.html')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testScraper = async () => {
    if (!url) {
      setError('Por favor, insira uma URL válida')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/scraper/porcelanosa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Erro desconhecido')
      }
    } catch (err: any) {
      setError(err.message || 'Erro na requisição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔍 Teste Scraper Porcelanosa</h1>
        <p className="text-muted-foreground">
          Teste as melhorias implementadas no scraper com interação dinâmica e extração multi-estratégia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Configuração do Teste</CardTitle>
          <CardDescription>
            Insira a URL do produto Porcelanosa para testar a extração de características
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="url" className="text-sm font-medium">URL do Produto:</label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://productfinder.porcelanosagrupo.com/..."
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={testScraper} 
            disabled={loading || !url}
            className="w-full"
          >
            {loading ? '⏳ Executando Scraper...' : '🚀 Testar Scraper'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">❌ Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✅ Resultado do Scraper</CardTitle>
              <CardDescription>
                Material extraído com sucesso - ID: {result.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">📝 Dados Básicos</h4>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Nome:</strong> {result.nome || 'N/A'}</li>
                    <li><strong>Referência:</strong> {result.referencia || 'N/A'}</li>
                    <li><strong>Marca:</strong> {result.marca || 'N/A'}</li>
                    <li><strong>Status:</strong> {result.aprovado ? '✅ Aprovado' : '⏳ Pendente'}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">📊 Estatísticas da Extração</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Características:</span>
                      <Badge variant={Object.keys(result.caracteristicas || {}).length > 0 ? "default" : "secondary"}>
                        {Object.keys(result.caracteristicas || {}).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Imagens:</span>
                      <Badge variant={result.imagens?.length > 0 ? "default" : "secondary"}>
                        {result.imagens?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Documentos:</span>
                      <Badge variant={Object.keys(result.documentos || {}).length > 0 ? "default" : "secondary"}>
                        {Object.keys(result.documentos || {}).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Embalagem:</span>
                      <Badge variant={Object.keys(result.embalagem || {}).length > 0 ? "default" : "secondary"}>
                        {Object.keys(result.embalagem || {}).length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle>🧠 Características Extraídas ({Object.keys(result.caracteristicas || {}).length})</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(result.caracteristicas || {}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(result.caracteristicas).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm">{key}:</span>
                      <span className="text-sm text-muted-foreground">{value as string}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  ⚠️ Nenhuma característica foi extraída. Isso pode indicar que:
                  <br />• O conteúdo é carregado dinamicamente via JavaScript
                  <br />• A estrutura da página mudou
                  <br />• É necessário clicar em tabs/accordions para expandir o conteúdo
                </p>
              )}
            </CardContent>
          </Card>

          {/* Imagens */}
          {result.imagens && result.imagens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>🖼️ Imagens Extraídas ({result.imagens.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.imagens.map((img: string, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{img}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos */}
          {result.documentos && Object.keys(result.documentos).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📄 Documentos Extraídos ({Object.keys(result.documentos).length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(result.documentos).map(([type, url]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm">{type}:</span>
                      <a href={url as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Ver documento →
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* JSON Completo */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 JSON Completo (Debug)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 