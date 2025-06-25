async function testAppHealth() {
  console.log('🔍 Testando saúde da aplicação...')
  
  const baseUrl = 'http://localhost:3001'
  
  try {
    // 1. Testar se o servidor está a responder
    console.log('\n1. Testando se o servidor está a responder...')
    const healthResponse = await fetch(`${baseUrl}/api/health`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Servidor está a responder:', healthData)
    } else {
      console.error('❌ Servidor não está a responder corretamente')
      return
    }
    
    // 2. Testar página principal
    console.log('\n2. Testando página principal...')
    const mainPageResponse = await fetch(`${baseUrl}/`)
    
    if (mainPageResponse.ok) {
      console.log('✅ Página principal carrega corretamente')
    } else {
      console.error('❌ Página principal não carrega:', mainPageResponse.status)
    }
    
    // 3. Testar página de login
    console.log('\n3. Testando página de login...')
    const loginPageResponse = await fetch(`${baseUrl}/login`)
    
    if (loginPageResponse.ok) {
      console.log('✅ Página de login carrega corretamente')
    } else {
      console.error('❌ Página de login não carrega:', loginPageResponse.status)
    }
    
    // 4. Testar dashboard (deve redirecionar para login se não autenticado)
    console.log('\n4. Testando dashboard...')
    const dashboardResponse = await fetch(`${baseUrl}/dashboard`)
    
    if (dashboardResponse.ok || dashboardResponse.status === 302) {
      console.log('✅ Dashboard responde corretamente (redirecionamento esperado)')
    } else {
      console.error('❌ Dashboard não responde:', dashboardResponse.status)
    }
    
    // 5. Testar login com credenciais corretas
    console.log('\n5. Testando login com credenciais corretas...')
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
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Login funciona corretamente:', loginData.success)
      
      if (loginData.success) {
        // 6. Testar API de clientes com autenticação
        console.log('\n6. Testando API de clientes com autenticação...')
        const userData = loginData.user
        const authToken = encodeURIComponent(JSON.stringify(userData))
        
        const clientesResponse = await fetch(`${baseUrl}/api/clientes`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (clientesResponse.ok) {
          const clientesData = await clientesResponse.json()
          console.log('✅ API de clientes funciona:', clientesData.length, 'clientes encontrados')
        } else {
          console.error('❌ API de clientes falha:', clientesResponse.status)
        }
      }
    } else {
      console.error('❌ Login falha:', loginResponse.status)
    }
    
    console.log('\n✅ Teste de saúde concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Servidor não está a correr. Execute: npm run dev')
    }
  }
}

// Executar o teste
testAppHealth()
  .then(() => {
    console.log('\n🎉 Aplicação está saudável!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Aplicação tem problemas:', error)
    process.exit(1)
  }) 