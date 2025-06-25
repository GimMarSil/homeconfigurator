const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testPorcelanosaScraper() {
  console.log('🧪 Testando scraper da Porcelanosa...')
  
  const testUrl = 'https://productfinder.porcelanosagrupo.com/pt/revestimentos_ceramicos/cosmos_s1_white_g.html'
  
  try {
    const response = await fetch('http://localhost:3000/api/scraper/porcelanosa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'user=eyJpZCI6MCwiZW1haWwiOiJhZG1pbkBob21lY29uZmlndXJhdG9yLnB0Iiwicm9sZSI6InN1cGVyX2FkbWluIn0='
      },
      body: JSON.stringify({ url: testUrl })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Scraper funcionou!')
      console.log('📊 Dados extraídos:')
      console.log('- Nome:', result.data.nome)
      console.log('- Referência:', result.data.referencia)
      console.log('- Marca:', result.data.marca)
      console.log('- Imagens:', result.data.imagens.length)
      console.log('- Documentos:', Object.keys(result.data.documentos).length)
      console.log('- Características:', Object.keys(result.data.caracteristicas).length)
      console.log('- Embalagem:', Object.keys(result.data.embalagem).length)
      console.log('- Instalação:', Object.keys(result.data.instalacao).length)
    } else {
      console.log('❌ Erro no scraper:', result.error)
      console.log('Detalhes:', result.details)
    }
  } catch (error) {
    console.error('❌ Erro ao testar scraper:', error.message)
  }
}

testPorcelanosaScraper() 