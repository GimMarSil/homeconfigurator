const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const path = require('path')

const BASE_URL = 'https://productfinder.porcelanosagrupo.com'

// Função para extrair seções de características, embalagem e instalação
async function extractSection(page, titulo) {
  const data = {}
  
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
async function extractDocumentos(page) {
  const documentos = []
  
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
async function extractImagens(page) {
  const imagens = []
  
  try {
    const imageUrls = await page.$$eval('img[src*="resources/img/high"], img[src*="resources/img/"]', imgs =>
      imgs.map(img => img.src)
    )
    
    for (const url of imageUrls) {
      if (url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))) {
        imagens.push(url)
      }
    }
    
    if (imagens.length === 0) {
      const allImages = await page.$$eval('img', imgs =>
        imgs.map(img => img.src)
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

async function testPorcelanosaScraper() {
  const testUrl = 'https://productfinder.porcelanosagrupo.com/pt/mosaicos_e_decorados/cambridge_arce_g.html'
  
  console.log('🧪 Testando scraper Porcelanosa melhorado...')
  console.log('🔗 URL de teste:', testUrl)
  
  const browser = await puppeteer.launch({
    headless: false, // Mudar para false para debug
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1920, height: 1080 })
    
    console.log('📄 Navegando para a página...')
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Aguardar carregamento completo
    console.log('⏳ Aguardando carregamento da página...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Tentar aguardar elementos específicos
    try {
      await page.waitForSelector('h1', { timeout: 10000 })
      console.log('✅ Título encontrado')
    } catch (e) {
      console.log('⚠️ Título não encontrado, continuando...')
    }
    
    // Debug: capturar screenshot
    await page.screenshot({ path: 'debug-page.png', fullPage: true })
    console.log('📸 Screenshot salvo como debug-page.png')
    
    // Debug: verificar HTML da página
    const pageContent = await page.content()
    await fs.writeFile('debug-page.html', pageContent, 'utf-8')
    console.log('📄 HTML salvo como debug-page.html')
    
    console.log('📋 Extraindo dados básicos...')
    const productData = await page.evaluate(() => {
      const product = {
        nome: '',
        nome_comercial: '',
        referencia: '',
        formato: '',
        codigo: '',
        ean: ''
      }

      // Extrair nome do produto - tentar múltiplos seletores
      const titleSelectors = [
        'h1',
        '.product-name',
        '.title',
        '[data-product-name]',
        '.product-title',
        '.main-title',
        '.product-info h1',
        '.product-header h1'
      ]
      
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          const text = element.textContent.trim()
          if (text && text.length > 0 && !text.includes('Digite palavras')) {
            product.nome = text
            break
          }
        }
      }

      // Extrair nome comercial
      const commercialSelectors = [
        '.product-name',
        'strong',
        '.commercial-name',
        '.product-commercial-name',
        '.product-brand'
      ]
      
      for (const selector of commercialSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          const text = element.textContent.trim()
          if (text && text.length > 0 && !text.includes('Digite palavras')) {
            product.nome_comercial = text
            break
          }
        }
      }

      // Extrair informações de referência - tentar múltiplas abordagens
      const referenceSelectors = [
        'div.product-sku > *',
        '.product-info > *',
        '.reference-info > *',
        '.product-details > *',
        '.product-specs > *',
        '.product-reference > *'
      ]
      
      for (const selector of referenceSelectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          const infoLines = Array.from(elements).map(el => el.textContent?.trim() || '').filter(text => text)
          
          if (infoLines.length >= 1) product.referencia = infoLines[0]
          if (infoLines.length >= 2) product.formato = infoLines[1]
          if (infoLines.length >= 3) product.codigo = infoLines[2]
          if (infoLines.length >= 4) product.ean = infoLines[3]?.replace('EAN-', '')
          
          if (product.referencia) break
        }
      }

      // Se não encontrou referência, tentar extrair do URL
      if (!product.referencia) {
        const urlPath = window.location.pathname
        const urlParts = urlPath.split('/')
        if (urlParts.length > 0) {
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart && lastPart.includes('_')) {
            product.referencia = lastPart.replace('.html', '').replace(/_g$/, '')
          }
        }
      }

      return product
    })

    console.log('📊 Dados básicos extraídos:', productData)

    console.log('📋 Extraindo características...')
    const caracteristicas = await extractSection(page, 'Características')
    console.log('✅ Características:', Object.keys(caracteristicas).length, 'campos')
    
    console.log('📦 Extraindo embalagem...')
    const embalagemData = await extractSection(page, 'Embalagem')
    const embalagem = Object.fromEntries(
      Object.entries(embalagemData).map(([key, values]) => [key, values[0] || ''])
    )
    console.log('✅ Embalagem:', Object.keys(embalagem).length, 'campos')
    
    console.log('🔧 Extraindo instalação...')
    const instalacao = await extractSection(page, 'Instalação')
    console.log('✅ Instalação:', Object.keys(instalacao).length, 'campos')
    
    console.log('📂 Extraindo documentos...')
    const documentos = await extractDocumentos(page)
    console.log('✅ Documentos:', documentos.length, 'arquivos')
    
    console.log('🖼️ Extraindo imagens...')
    const imagens = await extractImagens(page)
    console.log('✅ Imagens:', imagens.length, 'arquivos')

    const resultado = {
      ...productData,
      caracteristicas,
      embalagem,
      instalacao,
      documentos,
      imagens
    }

    console.log('\n📊 RESUMO DA EXTRAÇÃO:')
    console.log(`   Nome: ${resultado.nome}`)
    console.log(`   Nome Comercial: ${resultado.nome_comercial}`)
    console.log(`   Referência: ${resultado.referencia}`)
    console.log(`   Formato: ${resultado.formato}`)
    console.log(`   Código: ${resultado.codigo}`)
    console.log(`   EAN: ${resultado.ean}`)
    console.log(`   Características: ${Object.keys(resultado.caracteristicas).length} campos`)
    console.log(`   Embalagem: ${Object.keys(resultado.embalagem).length} campos`)
    console.log(`   Instalação: ${Object.keys(resultado.instalacao).length} campos`)
    console.log(`   Documentos: ${resultado.documentos.length} arquivos`)
    console.log(`   Imagens: ${resultado.imagens.length} arquivos`)

    if (Object.keys(resultado.caracteristicas).length > 0) {
      console.log('\n🧠 CARACTERÍSTICAS DETALHADAS:')
      for (const [key, values] of Object.entries(resultado.caracteristicas)) {
        console.log(`   ${key}: ${values.join(', ')}`)
      }
    }

    if (resultado.documentos.length > 0) {
      console.log('\n📄 DOCUMENTOS DETALHADOS:')
      for (const doc of resultado.documentos) {
        console.log(`   ${doc.categoria}: ${doc.nome} (${doc.tipo})`)
      }
    }

    if (resultado.imagens.length > 0) {
      console.log('\n🖼️ PRIMEIRAS 3 IMAGENS:')
      for (let i = 0; i < Math.min(3, resultado.imagens.length); i++) {
        console.log(`   ${i + 1}. ${resultado.imagens[i]}`)
      }
    }

    // Salvar resultado em arquivo
    const outputPath = path.join(process.cwd(), 'test-porcelanosa-result.json')
    await fs.writeFile(outputPath, JSON.stringify(resultado, null, 2), 'utf-8')
    console.log(`\n💾 Resultado salvo em: ${outputPath}`)

    console.log('\n✅ Teste concluído com sucesso!')
    
    // Aguardar um pouco para ver a página
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    return resultado

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// Executar teste
if (require.main === module) {
  testPorcelanosaScraper()
    .then(() => {
      console.log('🎉 Teste finalizado!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Teste falhou:', error)
      process.exit(1)
    })
}

module.exports = { testPorcelanosaScraper } 