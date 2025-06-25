import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import AdmZip from 'adm-zip'

interface PorcelanosaProduct {
  nome: string
  nome_comercial: string
  referencia: string
  formato: string
  codigo: string
  ean: string
  caracteristicas: Record<string, string[]>
  embalagem: Record<string, string>
  instalacao: Record<string, string[]>
  documentos: Array<{categoria: string, nome: string, url: string, tipo: string}>
  imagens: string[]
}

const BASE_URL = 'https://productfinder.porcelanosagrupo.com'

// Função para extrair seções de características, embalagem e instalação
async function extractSection(page: puppeteer.Page, titulo: string): Promise<Record<string, string[]>> {
  const data: Record<string, string[]> = {}
  
  try {
    const tituloVariations = [titulo, titulo.toUpperCase(), titulo.replace('Ç', 'C')]
    
    let section = null
    for (const variation of tituloVariations) {
      try {
        const [foundSection] = await page.$x(`//h2[contains(text(), "${variation}")]/following-sibling::*[1]`)
        if (foundSection) {
          section = foundSection
          break
        }
      } catch (e) {
        // Continuar tentando outras variações
      }
    }
    
    if (!section) return data

    const linhas = await section.$$('div, tr, li')
    for (const linha of linhas) {
      try {
        let label = ''
        let valor = ''
        
        const labelEl = await linha.$(':scope > div:first-child')
        const valorEl = await linha.$(':scope > div:last-child')
        
        if (labelEl && valorEl) {
          label = (await page.evaluate(el => el.textContent, labelEl)).trim()
          valor = (await page.evaluate(el => el.textContent, valorEl)).trim()
        } else {
          const cells = await linha.$$('td, th')
          if (cells.length >= 2) {
            label = (await page.evaluate(el => el.textContent, cells[0])).trim()
            valor = (await page.evaluate(el => el.textContent, cells[1])).trim()
          } else {
            const text = (await page.evaluate(el => el.textContent, linha)).trim()
            if (text.includes(':')) {
              const parts = text.split(':')
              label = parts[0].trim()
              valor = parts.slice(1).join(':').trim()
            }
          }
        }
        
        if (label && valor && label !== valor && label.length < 100 && valor.length < 200) {
          if (!data[label]) data[label] = []
          data[label].push(valor)
        }
      } catch (e) {
        // Continuar com próxima linha
      }
    }
  } catch (error) {
    console.log(`❌ Erro ao extrair seção "${titulo}":`, error)
  }
  
  return data
}

// Função para extrair documentos
async function extractDocumentos(page: puppeteer.Page): Promise<Array<{categoria: string, nome: string, url: string, tipo: string}>> {
  const documentos: Array<{categoria: string, nome: string, url: string, tipo: string}> = []
  
  try {
    const sections = ['CATÁLOGOS', 'DOCUMENTAÇÃO TÉCNICA', 'ARQUIVOS GRÁFICOS']

    for (const sec of sections) {
      try {
        const [sectionHandle] = await page.$x(`//h2[contains(text(), "${sec}")]/following-sibling::*[1]`)
        if (!sectionHandle) continue

        const links = await sectionHandle.$$('a')
        for (const link of links) {
          try {
            const nome = (await link.evaluate(el => el.textContent)).trim()
            const url = await link.evaluate(el => el.getAttribute('href'))
            
            if (nome && url) {
              const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
              const tipo = url.endsWith('.zip') ? 'ZIP' : 'PDF'
              
              let categoria = 'OUTROS'
              if (sec.includes('CATÁLOGOS')) categoria = 'CATALOGO'
              else if (sec.includes('TÉCNICA')) categoria = 'FICHA_TECNICA'
              else if (sec.includes('GRÁFICOS')) categoria = 'DESENHO_TECNICO'
              
              documentos.push({ categoria, nome, url: fullUrl, tipo })
            }
          } catch (e) {
            // Continuar com próximo link
          }
        }
      } catch (e) {
        // Continuar com próxima seção
      }
    }
  } catch (error) {
    console.log('❌ Erro ao extrair documentos:', error)
  }
  
  return documentos
}

// Função para extrair imagens
async function extractImagens(page: puppeteer.Page): Promise<string[]> {
  const imagens: string[] = []
  
  try {
    const imageUrls = await page.$$eval('img[src*="resources/img/high"], img[src*="resources/img/"]', imgs =>
      imgs.map(img => (img as HTMLImageElement).src)
    )
    
    for (const url of imageUrls) {
      if (url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))) {
        imagens.push(url)
      }
    }
    
    if (imagens.length === 0) {
      const allImages = await page.$$eval('img', imgs =>
        imgs.map(img => (img as HTMLImageElement).src)
      )
      
      for (const url of allImages) {
        if (url && !url.includes('logo') && !url.includes('icon') && 
            (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))) {
          imagens.push(url)
        }
      }
    }
  } catch (error) {
    console.log('❌ Erro ao extrair imagens:', error)
  }
  
  return imagens
}

// Função para fazer download de arquivo
async function downloadFile(url: string, page: puppeteer.Page): Promise<{buffer: Buffer, filename: string} | null> {
  try {
    console.log(`📥 Baixando: ${url}`)
    
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    
    if (response?.ok()) {
      const buffer = await response.buffer()
      const urlParts = url.split('/')
      const filename = urlParts[urlParts.length - 1] || `file_${Date.now()}.pdf`
      
      return { buffer, filename }
    }
  } catch (error) {
    console.log(`❌ Erro ao baixar ${url}:`, error)
  }
  
  return null
}

// Função para extrair arquivos de ZIP
async function extractZipFiles(zipBuffer: Buffer, materialId: number): Promise<string[]> {
  const extractedFiles: string[] = []
  
  try {
    const zip = new AdmZip(zipBuffer)
    const zipEntries = zip.getEntries()
    
    console.log(`🗂️ Extraindo ${zipEntries.length} arquivos do ZIP...`)
    
    for (const entry of zipEntries) {
      try {
        const fileName = entry.entryName.toLowerCase()
        if (fileName.match(/\.(jpg|jpeg|png|webp|tiff|bmp)$/)) {
          const buffer = entry.getData()
          
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 15)
          const extension = fileName.split('.').pop() || 'jpg'
          const newFileName = `zip_image_${materialId}_${timestamp}_${randomString}.${extension}`
          
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materiais')
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
          }
          
          const filePath = path.join(uploadDir, newFileName)
          fs.writeFileSync(filePath, buffer)
          
          const relativePath = `/uploads/materiais/${newFileName}`
          extractedFiles.push(relativePath)
          
          console.log(`🖼️ Imagem extraída: ${newFileName} (${Math.round(buffer.length / 1024)} KB)`)
        }
      } catch (e) {
        console.log(`⚠️ Erro ao processar arquivo do ZIP: ${entry.entryName}`)
      }
    }
  } catch (error) {
    console.log('❌ Erro ao extrair ZIP:', error)
  }
  
  return extractedFiles
}

// Função para criar ficheiro na base de dados
async function createFicheiro(materialId: number, fileData: {
  nomeOriginal: string
  nomeArquivo: string
  caminho: string
  tamanho: number
  tipoMime: string
  categoria: string
  descricao: string
}) {
  try {
    await prisma.ficheiro.create({
      data: {
        ...fileData,
        materialId
      }
    })
    console.log(`✅ Ficheiro criado: ${fileData.nomeOriginal}`)
  } catch (error) {
    console.log(`❌ Erro ao criar ficheiro ${fileData.nomeOriginal}:`, error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { url } = await request.json()

    if (!url || !url.includes('porcelanosagrupo.com')) {
      return NextResponse.json({ error: 'URL inválida da Porcelanosa' }, { status: 400 })
    }

    console.log('🔍 Iniciando scraper melhorado para:', url)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    })

    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1920, height: 1080 })
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    
    console.log('📄 Página carregada, extraindo dados...')

    // Extrair dados do produto
    const productData = await page.evaluate(() => {
      const product: PorcelanosaProduct = {
        nome: '',
        nome_comercial: '',
        referencia: '',
        formato: '',
        codigo: '',
        ean: '',
        caracteristicas: {},
        embalagem: {},
        instalacao: {},
        documentos: [],
        imagens: []
      }

      // Extrair nome do produto
      const titleSelectors = ['h1', '.product-name', '.title', '[data-product-name]']
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          product.nome = element.textContent.trim()
          break
        }
      }

      // Extrair nome comercial
      const commercialSelectors = ['.product-name', 'strong', '.commercial-name']
      for (const selector of commercialSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          product.nome_comercial = element.textContent.trim()
          break
        }
      }

      // Extrair informações de referência
      const infoElements = document.querySelectorAll('div.product-sku > *, .product-info > *, .reference-info > *')
      const infoLines = Array.from(infoElements).map(el => el.textContent?.trim() || '').filter(text => text)
      
      if (infoLines.length >= 1) product.referencia = infoLines[0]
      if (infoLines.length >= 2) product.formato = infoLines[1]
      if (infoLines.length >= 3) product.codigo = infoLines[2]
      if (infoLines.length >= 4) product.ean = infoLines[3]?.replace('EAN-', '')

      return product
    })

    // Extrair seções usando as funções auxiliares
    console.log('📋 Extraindo características...')
    productData.caracteristicas = await extractSection(page, 'Características')
    
    console.log('📦 Extraindo embalagem...')
    const embalagemData = await extractSection(page, 'Embalagem')
    productData.embalagem = Object.fromEntries(
      Object.entries(embalagemData).map(([key, values]) => [key, values[0] || ''])
    )
    
    console.log('🔧 Extraindo instalação...')
    productData.instalacao = await extractSection(page, 'Instalação')
    
    console.log('📂 Extraindo documentos...')
    productData.documentos = await extractDocumentos(page)
    
    console.log('🖼️ Extraindo imagens...')
    productData.imagens = await extractImagens(page)

    console.log('📊 Dados extraídos:', {
      nome: productData.nome,
      nome_comercial: productData.nome_comercial,
      referencia: productData.referencia,
      caracteristicas: Object.keys(productData.caracteristicas).length,
      embalagem: Object.keys(productData.embalagem).length,
      instalacao: Object.keys(productData.instalacao).length,
      documentos: productData.documentos.length,
      imagens: productData.imagens.length
    })

    // Verificar se já existe um material com a mesma URL
    const materialExistente = await prisma.material.findFirst({
      where: { urlFabricante: url }
    })
    
    if (materialExistente) {
      await browser.close()
      return NextResponse.json({
        success: true,
        data: materialExistente,
        message: `Material já existe: ${materialExistente.nome}`,
        detalhes: {
          imagens: productData.imagens.length,
          documentos: productData.documentos.length,
          caracteristicas: Object.keys(productData.caracteristicas).length
        }
      })
    }

    // Criar o material na base de dados
    console.log('💾 Criando material na base de dados...')
    
    let tipoMaterialId = 1
    const tipoExistente = await prisma.tipoMaterial.findUnique({
      where: { id: tipoMaterialId }
    })
    
    if (!tipoExistente) {
      const novoTipo = await prisma.tipoMaterial.create({
        data: {
          nome: 'Revestimento Cerâmico',
          categoria: 'Acabamentos',
          unidadeMedida: 'm²',
          descricao: 'Revestimento cerâmico Porcelanosa'
        }
      })
      tipoMaterialId = novoTipo.id
    }

    let referenciaUnica = productData.referencia
    if (!referenciaUnica || referenciaUnica.trim() === '') {
      referenciaUnica = `POR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    }

    const novoMaterial = await prisma.material.create({
      data: {
        nome: productData.nome || productData.nome_comercial || 'Produto Porcelanosa',
        referencia: referenciaUnica,
        marca: 'Porcelanosa',
        descricao: Object.entries(productData.caracteristicas).slice(0, 2).map(([k, v]) => `${k}: ${v[0]?.substring(0, 30)}`).join(' | ').substring(0, 250),
        precoUnitario: 0,
        fornecedor: 'Porcelanosa',
        urlFabricante: url,
        imagem: '',
        fichaTecnica: '',
        disponivel: true,
        tipoMaterialId: tipoMaterialId,
        isGlobal: false,
        aprovado: false,
        clienteId: user.clienteId || null,
        caracteristicas: Object.keys(productData.caracteristicas).length > 0 ? productData.caracteristicas : null,
        embalagem: Object.keys(productData.embalagem).length > 0 ? productData.embalagem : null,
        instalacao: Object.keys(productData.instalacao).length > 0 ? productData.instalacao : null
      }
    })

    console.log('✅ Material criado com ID:', novoMaterial.id)

    // Download e processamento de imagens
    console.log('🖼️ Processando imagens...')
    const downloadedImages: string[] = []
    
    for (let i = 0; i < Math.min(productData.imagens.length, 10); i++) {
      const imageUrl = productData.imagens[i]
      const downloadResult = await downloadFile(imageUrl, page)
      
      if (downloadResult) {
        const { buffer, filename } = downloadResult
        
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = filename.split('.').pop() || 'jpg'
        const newFileName = `material_${novoMaterial.id}_${timestamp}_${randomString}.${extension}`
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materiais')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        
        const filePath = path.join(uploadDir, newFileName)
        fs.writeFileSync(filePath, buffer)
        
        const relativePath = `/uploads/materiais/${newFileName}`
        downloadedImages.push(relativePath)
        
        await createFicheiro(novoMaterial.id, {
          nomeOriginal: `Imagem ${i + 1} - ${productData.nome}`,
          nomeArquivo: newFileName,
          caminho: relativePath,
          tamanho: buffer.length,
          tipoMime: `image/${extension}`,
          categoria: 'IMAGEM_MATERIAL',
          descricao: `Imagem ${i + 1} do produto ${productData.nome}`
        })
        
        if (i === 0) {
          await prisma.material.update({
            where: { id: novoMaterial.id },
            data: { imagem: relativePath }
          })
        }
      }
    }

    // Download e processamento de documentos
    console.log('📄 Processando documentos...')
    const downloadedDocs: string[] = []
    
    for (const documento of productData.documentos) {
      const downloadResult = await downloadFile(documento.url, page)
      
      if (downloadResult) {
        const { buffer, filename } = downloadResult
        
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const extension = filename.split('.').pop() || 'pdf'
        const newFileName = `doc_${documento.categoria.toLowerCase()}_${novoMaterial.id}_${timestamp}_${randomString}.${extension}`
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'materiais')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        
        const filePath = path.join(uploadDir, newFileName)
        fs.writeFileSync(filePath, buffer)
        
        const relativePath = `/uploads/materiais/${newFileName}`
        downloadedDocs.push(relativePath)
        
        await createFicheiro(novoMaterial.id, {
          nomeOriginal: documento.nome,
          nomeArquivo: newFileName,
          caminho: relativePath,
          tamanho: buffer.length,
          tipoMime: documento.tipo === 'ZIP' ? 'application/zip' : 'application/pdf',
          categoria: documento.categoria as any,
          descricao: documento.nome
        })
        
        if (documento.tipo === 'ZIP') {
          console.log('🗂️ Extraindo imagens do ZIP...')
          const extractedImages = await extractZipFiles(buffer, novoMaterial.id)
          
          for (const extractedImage of extractedImages) {
            downloadedImages.push(extractedImage)
            
            await createFicheiro(novoMaterial.id, {
              nomeOriginal: `Imagem extraída - ${documento.nome}`,
              nomeArquivo: path.basename(extractedImage),
              caminho: extractedImage,
              tamanho: 0,
              tipoMime: 'image/jpeg',
              categoria: 'IMAGEM_MATERIAL',
              descricao: `Imagem extraída do documento ${documento.nome}`
            })
          }
        }
        
        if (downloadedDocs.length === 1) {
          await prisma.material.update({
            where: { id: novoMaterial.id },
            data: { fichaTecnica: relativePath }
          })
        }
      }
    }

    await browser.close()

    const materialCompleto = await prisma.material.findUnique({
      where: { id: novoMaterial.id },
      include: {
        tipoMaterial: true,
        cliente: { select: { id: true, nome: true } },
        ficheiros: true
      }
    })

    if (!novoMaterial.isGlobal && user.clienteId) {
      await prisma.notificacao.create({
        data: {
          titulo: 'Novo material Porcelanosa',
          mensagem: `Material extraído do site Porcelanosa: ${productData.nome}`,
          tipo: 'DOCUMENTO_ADICIONADO',
          clienteId: user.clienteId,
          remetenteId: user.id,
          url: `/dashboard/materiais/${novoMaterial.id}`
        }
      })
    }

    console.log('✅ Scraper Porcelanosa concluído com sucesso')
    console.log(`📊 Resumo: ${downloadedImages.length} imagens, ${downloadedDocs.length} documentos, ${Object.keys(productData.caracteristicas).length} características`)

    return NextResponse.json({
      success: true,
      data: materialCompleto,
      message: `Material Porcelanosa criado com sucesso: ${productData.nome}`,
      detalhes: {
        imagens: downloadedImages.length,
        documentos: downloadedDocs.length,
        caracteristicas: Object.keys(productData.caracteristicas).length,
        embalagem: Object.keys(productData.embalagem).length,
        instalacao: Object.keys(productData.instalacao).length
      }
    })

  } catch (error) {
    console.error('❌ Erro no scraper Porcelanosa:', error)
    return NextResponse.json({ 
      error: 'Erro ao fazer scraper do produto Porcelanosa',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 