#!/usr/bin/env node

/**
 * Script para testar autenticação em diferentes cenários
 * Execute: node scripts/test-auth.js
 */

// Detectar a porta automaticamente ou usar variável de ambiente
const getApiUrl = () => {
  // Tentar variáveis de ambiente primeiro
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  if (process.env.BASE_URL) {
    return process.env.BASE_URL
  }
  
  // Fallback para localhost na porta padrão
  const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || 3000
  return `http://localhost:${port}`
}

const baseUrl = getApiUrl()

async function testAuth() {
  console.log('🔐 Testando Autenticação Home Configurator')
  console.log('=' .repeat(50))
  console.log('🌐 API URL:', baseUrl)
  console.log('')

  // Teste 1: Health check
  console.log('🏥 Testando conectividade com o servidor...')
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET'
    })
    
    if (response.ok) {
      console.log('✅ Servidor está online')
    } else {
      console.log('⚠️ Servidor respondeu mas pode ter problemas:', response.status)
    }
  } catch (error) {
    console.log('❌ Servidor não está acessível:', error.message)
    console.log('💡 Certifique-se de que a aplicação está em execução')
    console.log('   Inicie com: npm run dev')
    return
  }

  // Teste 2: Login com Super Admin
  console.log('\n1️⃣ Testando login Super Admin...')
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@homeconfigurator.pt',
        password: 'admin123'
      })
    })

    const loginData = await loginResponse.json()
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login bem-sucedido!')
      console.log('👤 Utilizador:', {
        id: loginData.user.id,
        name: loginData.user.name,
        email: loginData.user.email,
        role: loginData.user.role
      })

      // Teste 3: Chamada à API com token
      console.log('\n2️⃣ Testando chamada à API com token...')
      
      const authToken = encodeURIComponent(JSON.stringify(loginData.user))
      
      const apiResponse = await fetch(`${baseUrl}/api/clientes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (apiResponse.ok) {
        const clientesData = await apiResponse.json()
        console.log('✅ API clientes funcionando!')
        console.log(`📊 ${clientesData.length} clientes encontrados`)
      } else {
        const errorData = await apiResponse.json()
        console.log('❌ Erro na API clientes:', {
          status: apiResponse.status,
          error: errorData.error
        })
      }

      // Teste 4: Chamada à API de materiais
      console.log('\n3️⃣ Testando API de materiais...')
      
      const materiaisResponse = await fetch(`${baseUrl}/api/materiais`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (materiaisResponse.ok) {
        const materiaisData = await materiaisResponse.json()
        console.log('✅ API materiais funcionando!')
        console.log(`📊 ${materiaisData.length} materiais encontrados`)
      } else {
        const errorData = await materiaisResponse.json()
        console.log('❌ Erro na API materiais:', {
          status: materiaisResponse.status,
          error: errorData.error
        })
      }

    } else {
      console.log('❌ Erro no login:', loginData.error)
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message)
  }

  // Teste 5: Chamada sem autenticação
  console.log('\n4️⃣ Testando chamada sem autenticação...')
  try {
    const noAuthResponse = await fetch(`${baseUrl}/api/clientes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (noAuthResponse.status === 401) {
      console.log('✅ Proteção funcionando - 401 retornado sem auth')
    } else {
      console.log('⚠️ Possível problema - esperado 401, recebido:', noAuthResponse.status)
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message)
  }

  // Teste 6: Token inválido
  console.log('\n5️⃣ Testando token inválido...')
  try {
    const invalidTokenResponse = await fetch(`${baseUrl}/api/clientes`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    })

    if (invalidTokenResponse.status === 401) {
      console.log('✅ Validação de token funcionando - 401 retornado')
    } else {
      console.log('⚠️ Possível problema - esperado 401, recebido:', invalidTokenResponse.status)
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message)
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🏁 Testes concluídos!')
  console.log('\n💡 Como usar:')
  console.log('   - PORT=3000 node scripts/test-auth.js')
  console.log('   - NEXT_PUBLIC_API_URL=http://localhost:3001 node scripts/test-auth.js')
  console.log('   - BASE_URL=http://exemplo.com node scripts/test-auth.js')
}

// Verificar se foi chamado diretamente
if (require.main === module) {
  testAuth().catch(console.error)
}

module.exports = { testAuth } 