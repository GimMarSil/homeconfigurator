async function testAuthAndAPI() {
  console.log('🔍 Testando autenticação e API de clientes...')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // 1. Testar health check
    console.log('\n1. Testando health check...')
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    const healthData = await healthResponse.json()
    console.log('Health check response:', healthData)
    
    // 2. Testar login com super admin (usando o email correto da base de dados)
    console.log('\n2. Testando login com super admin...')
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@homeconfigurator.pt',
        password: 'admin123'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('Login response status:', loginResponse.status)
    console.log('Login response data:', loginData)
    
    if (!loginResponse.ok) {
      console.error('❌ Login falhou')
      return
    }
    
    // 3. Extrair dados do utilizador para o token
    const userData = loginData.user
    console.log('User data:', userData)
    
    // 4. Criar token de autorização
    const authToken = encodeURIComponent(JSON.stringify(userData))
    console.log('Auth token created:', authToken.substring(0, 100) + '...')
    
    // 5. Testar API de clientes com autenticação
    console.log('\n3. Testando API de clientes (GET)...')
    const clientesResponse = await fetch(`${baseUrl}/api/clientes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Clientes GET response status:', clientesResponse.status)
    
    if (clientesResponse.ok) {
      const clientesData = await clientesResponse.json()
      console.log('Clientes encontrados:', clientesData.length)
      clientesData.forEach(cliente => {
        console.log(`  - ${cliente.nome} (${cliente.email})`)
      })
    } else {
      const errorData = await clientesResponse.json()
      console.error('Erro ao buscar clientes:', errorData)
    }
    
    // 6. Testar criação de cliente
    console.log('\n4. Testando criação de cliente (POST)...')
    const novoCliente = {
      nome: 'Cliente Teste API',
      email: 'teste.api@exemplo.com',
      telefone: '+351 912 345 678',
      morada: 'Rua Teste, 123',
      nif: '123456789',
      status: 'ATIVO'
    }
    
    const createResponse = await fetch(`${baseUrl}/api/clientes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novoCliente)
    })
    
    console.log('Create cliente response status:', createResponse.status)
    
    if (createResponse.ok) {
      const createdCliente = await createResponse.json()
      console.log('✅ Cliente criado com sucesso:', createdCliente)
    } else {
      const errorData = await createResponse.json()
      console.error('❌ Erro ao criar cliente:', errorData)
      
      // Se for erro de email duplicado, tentar com email diferente
      if (errorData.error && errorData.error.includes('email')) {
        console.log('\n5. Tentando com email diferente...')
        novoCliente.email = `teste.api.${Date.now()}@exemplo.com`
        
        const retryResponse = await fetch(`${baseUrl}/api/clientes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoCliente)
        })
        
        console.log('Retry create response status:', retryResponse.status)
        
        if (retryResponse.ok) {
          const retryCliente = await retryResponse.json()
          console.log('✅ Cliente criado com sucesso (retry):', retryCliente)
        } else {
          const retryError = await retryResponse.json()
          console.error('❌ Erro no retry:', retryError)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Executar o teste
testAuthAndAPI()
  .then(() => {
    console.log('\n✅ Teste concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error)
    process.exit(1)
  }) 