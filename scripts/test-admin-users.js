const { PrismaClient } = require('../lib/generated/prisma')

async function testAdminUsers() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://hc_admin:MAWmqrcdr1.1@192.168.1.116:3306/homeconfigurator"
      }
    }
  })

  try {
    console.log('👨‍💼 UTILIZADORES ADMINISTRADORES DISPONÍVEIS:\n')

    // Super Admin Global
    const superAdmin = await prisma.utilizador.findFirst({
      where: {
        email: 'admin@homeconfigurator.pt'
      }
    })

    if (superAdmin) {
      console.log('🔑 SUPER ADMINISTRADOR (Acesso a todos os clientes):')
      console.log(`   Email: ${superAdmin.email}`)
      console.log(`   Password: admin123`)
      console.log(`   Status: ${superAdmin.status}`)
      console.log('')
    } else {
      console.log('⚠️  Super Administrador não encontrado!')
      console.log('')
    }

    // Admins por cliente
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' }
    })

    console.log('🏢 ADMINISTRADORES POR CLIENTE:\n')

    for (const cliente of clientes) {
      console.log(`📋 Cliente: ${cliente.nome}`)
      
      const adminsCliente = await prisma.utilizador.findMany({
        where: {
          clienteId: cliente.id,
          role: 'ADMIN',
          status: 'ATIVO'
        },
        orderBy: { nome: 'asc' }
      })

      if (adminsCliente.length > 0) {
        adminsCliente.forEach(admin => {
          console.log(`   👤 ${admin.nome}`)
          console.log(`      Email: ${admin.email}`)
          console.log(`      Password: admin123`)
          console.log(`      Função: ${admin.role}`)
          console.log('')
        })
      } else {
        console.log('   ⚠️  Nenhum administrador encontrado')
        console.log('')
      }
    }

    // Estatísticas
    const totalUtilizadores = await prisma.utilizador.count()
    const utilizadoresAtivos = await prisma.utilizador.count({ where: { status: 'ATIVO' } })
    const admins = await prisma.utilizador.count({ where: { role: 'ADMIN' } })
    const gestores = await prisma.utilizador.count({ where: { role: 'GESTOR' } })
    const visualizadores = await prisma.utilizador.count({ where: { role: 'VISUALIZADOR' } })

    console.log('📊 ESTATÍSTICAS DO SISTEMA:')
    console.log(`   Total de utilizadores: ${totalUtilizadores}`)
    console.log(`   Utilizadores ativos: ${utilizadoresAtivos}`)
    console.log(`   Administradores: ${admins}`)
    console.log(`   Gestores: ${gestores}`)
    console.log(`   Visualizadores: ${visualizadores}`)
    console.log('')

    console.log('🔧 COMO TESTAR:')
    console.log('1. Aceda a http://localhost:3000/login')
    console.log('2. Use qualquer email acima com password: admin123')
    console.log('3. O Super Admin tem acesso a todos os clientes')
    console.log('4. Os admins de cliente só veem o seu cliente específico')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUsers()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  }) 