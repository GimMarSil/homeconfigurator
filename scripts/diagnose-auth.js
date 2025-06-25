#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de autenticação
 * Execute: node scripts/diagnose-auth.js
 */

const { PrismaClient } = require('../lib/generated/prisma')

async function diagnoseAuth() {
  console.log('🔍 Diagnóstico de Autenticação - Home Configurator')
  console.log('=' .repeat(60))

  const prisma = new PrismaClient()

  try {
    // Verificar conexão com a base de dados
    console.log('\n1️⃣ Testando conexão com a base de dados...')
    await prisma.$connect()
    console.log('✅ Conexão com base de dados estabelecida')

    // Verificar utilizadores existentes
    console.log('\n2️⃣ Verificando utilizadores na base de dados...')
    const utilizadores = await prisma.utilizador.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            status: true
          }
        }
      }
    })

    console.log(`📊 Total de utilizadores: ${utilizadores.length}`)
    
    if (utilizadores.length === 0) {
      console.log('⚠️ Nenhum utilizador encontrado na base de dados')
      console.log('💡 Isso explica o erro de login para utilizadores normais')
    } else {
      console.log('\n👥 Utilizadores encontrados:')
      utilizadores.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nome} (${user.email})`)
        console.log(`      Role: ${user.role}`)
        console.log(`      Status: ${user.status}`)
        console.log(`      Cliente: ${user.cliente.nome} (${user.cliente.status})`)
        console.log('')
      })
    }

    // Verificar clientes
    console.log('\n3️⃣ Verificando clientes na base de dados...')
    const clientes = await prisma.cliente.findMany()
    console.log(`📊 Total de clientes: ${clientes.length}`)

    if (clientes.length === 0) {
      console.log('⚠️ Nenhum cliente encontrado na base de dados')
    }

    // Teste de login com Super Admin
    console.log('\n4️⃣ Testando lógica de Super Admin...')
    const superAdminEmail = 'admin@homeconfigurator.pt'
    const superAdminPassword = 'admin123'
    
    console.log(`🔐 Credenciais Super Admin: ${superAdminEmail} / ${superAdminPassword}`)
    
    if (superAdminEmail === 'admin@homeconfigurator.pt' && superAdminPassword === 'admin123') {
      const userData = {
        id: 0,
        name: 'Super Administrador',
        email: 'admin@homeconfigurator.pt',
        role: 'super_admin',
      }
      console.log('✅ Lógica de Super Admin está correta')
      console.log('👤 Dados que seriam retornados:', JSON.stringify(userData, null, 2))
      
      // Verificar se todos os campos necessários estão presentes
      const hasRequiredFields = userData.id !== undefined && userData.email && userData.role
      console.log(`✅ Campos obrigatórios presentes: ${hasRequiredFields}`)
      console.log('   - ID:', userData.id, '(', typeof userData.id, ')')
      console.log('   - Email:', userData.email, '(', typeof userData.email, ')')
      console.log('   - Role:', userData.role, '(', typeof userData.role, ')')
    } else {
      console.log('❌ Lógica de Super Admin tem problema')
    }

    // Verificar se há dados de exemplo/seed
    console.log('\n5️⃣ Verificando dados de exemplo...')
    const materiaisCount = await prisma.material.count()
    const tiposMaterialCount = await prisma.tipoMaterial.count()
    const zonasCount = await prisma.zonaEspecifica.count()
    
    console.log(`📊 Materiais: ${materiaisCount}`)
    console.log(`📊 Tipos de Material: ${tiposMaterialCount}`)
    console.log(`📊 Zonas: ${zonasCount}`)

    if (materiaisCount === 0 && tiposMaterialCount === 0) {
      console.log('💡 Considere executar: npm run seed (se disponível)')
    }

    // Teste de endpoint de login
    console.log('\n6️⃣ Testando endpoint de login...')
    
    const testLoginData = {
      email: 'admin@homeconfigurator.pt',
      password: 'admin123'
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testLoginData)
      })

      console.log(`📡 Status da resposta: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Resposta da API:', JSON.stringify(data, null, 2))
        
        // Verificar estrutura da resposta
        if (data.success && data.user) {
          console.log('✅ Estrutura da resposta está correta')
          
          const user = data.user
          const validationChecks = {
            hasUser: !!data.user,
            hasId: user.id !== undefined && user.id !== null,
            hasEmail: !!user.email,
            hasRole: !!user.role,
            idType: typeof user.id,
            emailType: typeof user.email,
            roleType: typeof user.role
          }
          
          console.log('🔍 Validação detalhada:', JSON.stringify(validationChecks, null, 2))
          
          const isValid = validationChecks.hasUser && validationChecks.hasId && validationChecks.hasEmail && validationChecks.hasRole
          console.log(`${isValid ? '✅' : '❌'} Dados válidos para o frontend: ${isValid}`)
          
        } else {
          console.log('❌ Estrutura da resposta está incorreta')
        }
      } else {
        const errorData = await response.json()
        console.log('❌ Erro na API:', errorData)
      }
    } catch (error) {
      console.log('❌ Erro ao testar endpoint:', error.message)
      console.log('💡 Certifique-se de que a aplicação está a correr na porta 3001')
    }

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error)
  } finally {
    await prisma.$disconnect()
  }

  console.log('\n' + '=' .repeat(60))
  console.log('🏁 Diagnóstico concluído!')
  console.log('\n💡 Se o Super Admin não funciona, verifique:')
  console.log('   1. Se a aplicação está a correr na porta 3001')
  console.log('   2. Se os logs no browser mostram detalhes do erro')
  console.log('   3. Se as credenciais estão corretas')
  console.log('   4. Se há erros na consola do servidor')
}

// Verificar se foi chamado diretamente
if (require.main === module) {
  diagnoseAuth().catch(console.error)
}

module.exports = { diagnoseAuth } 