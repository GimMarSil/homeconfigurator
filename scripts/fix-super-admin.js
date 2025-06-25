const { PrismaClient } = require('../lib/generated/prisma')
const bcrypt = require('bcryptjs')

async function fixSuperAdmin() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://hc_admin:MAWmqrcdr1.1@192.168.1.116:3306/homeconfigurator"
      }
    }
  })

  try {
    console.log('🔍 Verificando Super Administrador...')

    // Verificar se existe o Super Admin
    let superAdmin = await prisma.utilizador.findFirst({
      where: {
        email: 'admin@homeconfigurator.pt'
      }
    })

    if (!superAdmin) {
      console.log('❌ Super Administrador não encontrado. Criando...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      superAdmin = await prisma.utilizador.create({
        data: {
          nome: 'Super Administrador',
          email: 'admin@homeconfigurator.pt',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ATIVO',
          clienteId: null // Super admin não é específico de um cliente
        }
      })
      console.log('✅ Super Administrador criado com sucesso!')
    } else {
      console.log('✅ Super Administrador encontrado:', superAdmin.nome)
    }

    // Buscar todos os clientes
    const clientes = await prisma.cliente.findMany()
    console.log(`📋 Encontrados ${clientes.length} clientes`)

    // Para cada cliente, verificar se tem um admin local e adicionar se necessário
    for (const cliente of clientes) {
      console.log(`\n🏢 Processando cliente: ${cliente.nome}`)
      
      // Verificar se já tem um admin para este cliente
      const adminExistente = await prisma.utilizador.findFirst({
        where: {
          clienteId: cliente.id,
          role: 'ADMIN',
          status: 'ATIVO'
        }
      })

      if (!adminExistente) {
        console.log(`   ⚠️  Cliente ${cliente.nome} não tem administrador`)
        
        // Criar um admin específico para este cliente baseado no super admin
        const hashedPassword = await bcrypt.hash('admin123', 10)
        
        const novoAdmin = await prisma.utilizador.create({
          data: {
            nome: `Admin ${cliente.nome}`,
            email: `admin.${cliente.nome.toLowerCase().replace(/\s+/g, '.')}@homeconfigurator.pt`,
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ATIVO',
            clienteId: cliente.id
          }
        })
        
        console.log(`   ✅ Administrador criado: ${novoAdmin.email}`)
      } else {
        console.log(`   ✅ Cliente já tem administrador: ${adminExistente.email}`)
      }

      // Listar todos os utilizadores do cliente
      const utilizadoresCliente = await prisma.utilizador.findMany({
        where: { clienteId: cliente.id }
      })
      
      console.log(`   👥 Utilizadores: ${utilizadoresCliente.length}`)
      utilizadoresCliente.forEach(u => {
        console.log(`      - ${u.nome} (${u.email}) - ${u.role} - ${u.status}`)
      })
    }

    // Mostrar estatísticas finais
    const totalUtilizadores = await prisma.utilizador.count()
    const utilizadoresAtivos = await prisma.utilizador.count({
      where: { status: 'ATIVO' }
    })
    const admins = await prisma.utilizador.count({
      where: { role: 'ADMIN' }
    })

    console.log('\n📊 ESTATÍSTICAS FINAIS:')
    console.log(`   Total de utilizadores: ${totalUtilizadores}`)
    console.log(`   Utilizadores ativos: ${utilizadoresAtivos}`)
    console.log(`   Administradores: ${admins}`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSuperAdmin()
  .then(() => {
    console.log('\n🎉 Processo concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  }) 