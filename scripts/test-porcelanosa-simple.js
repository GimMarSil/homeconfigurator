const fetch = require('node-fetch')

async function testPorcelanosaScraper() {
  console.log('🧪 Testando scraper da Porcelanosa...')
  
  try {
    // Primeiro fazer login para obter cookie de autenticação
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@homeconfigurator.pt',
        password: 'admin123'
      })
    })

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`)
    }

    const loginData = await loginResponse.json()
    console.log('✅ Login realizado com sucesso')

    // Extrair cookie de autenticação
    const cookies = loginResponse.headers.get('set-cookie')
    if (!cookies) {
      throw new Error('Cookie de autenticação não encontrado')
    }

    // Testar scraper com autenticação
    const scraperResponse = await fetch('http://localhost:3000/api/scraper/porcelanosa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        url: 'https://productfinder.porcelanosagrupo.com/pt/revestimentos_ceramicos/cosmos_s1_white_g.html'
      })
    })

    console.log('Status:', scraperResponse.status)
    const response = await scraperResponse.json()
    console.log('Response:', JSON.stringify(response, null, 2))

    if (scraperResponse.ok && response.success) {
      console.log('✅ Scraper funcionou!')
      console.log('📊 Dados extraídos:')
      console.log('- Nome:', response.data.nome)
      console.log('- Referência:', response.data.referencia)
      console.log('- Marca:', response.data.marca)
      console.log('- ID do Material:', response.data.id)
      console.log('- Imagens:', response.data.imagens.length)
      console.log('- Documentos:', Object.keys(response.data.documentos).length)
      console.log('- Embalagem:', Object.keys(response.data.embalagem).length)
      console.log('- Instalação:', Object.keys(response.data.instalacao).length)
    } else {
      console.log('❌ Erro no scraper:', response.error)
      console.log('Detalhes:', response.details)
    }

  } catch (error) {
    console.error('❌ Erro ao testar scraper:', error.message)
  }
}

testPorcelanosaScraper() 