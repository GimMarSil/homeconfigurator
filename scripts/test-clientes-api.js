const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testClientesAPI() {
  console.log('🔍 Testando API de Clientes...')
  
  try {
    // 1. Testar conexão com a base de dados
    console.log('\n1. Testando conexão com a base de dados...')
    await prisma.$connect()
    console.log('✅ Conexão com a base de dados estabelecida')
    
    // 2. Verificar se existem super admins
    console.log('\n2. Verificando super admins...')
    const superAdmins = await prisma.utilizador.findMany({
      where: {
        role: 'SUPER_ADMIN',
        status: 'ATIVO'
      }
    })
    
    console.log(`Encontrados ${superAdmins.length} super admins:`)
    superAdmins.forEach(admin => {
      console.log(`  - ID: ${admin.id}, Nome: ${admin.nome}, Email: ${admin.email}`)
    })
    
    // 3. Verificar clientes existentes
    console.log('\n3. Verificando clientes existentes...')
    const clientes = await prisma.cliente.findMany({
      include: {
        utilizadores: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            status: true
          }
        },
        edificios: {
          select: {
            id: true,
            nome: true,
            estado: true
          }
        }
      }
    })
    
    console.log(`Encontrados ${clientes.length} clientes:`)
    clientes.forEach(cliente => {
      console.log(`  - ID: ${cliente.id}, Nome: ${cliente.nome}, Email: ${cliente.email}`)
      console.log(`    Utilizadores: ${cliente.utilizadores.length}`)
      console.log(`    Edifícios: ${cliente.edificios.length}`)
    })
    
    // 4. Testar criação de cliente (simulação)
    console.log('\n4. Testando criação de cliente...')
    const novoClienteData = {
      nome: 'Cliente Teste API',
      email: 'teste.api@exemplo.com',
      telefone: '+351 912 345 678',
      morada: 'Rua Teste, 123',
      nif: '123456789',
      status: 'ATIVO'
    }
    
    // Verificar se email já existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { email: novoClienteData.email }
    })
    
    if (clienteExistente) {
      console.log('⚠️ Cliente com este email já existe, não vai criar')
    } else {
      console.log('✅ Dados do cliente válidos para criação')
    }
    
    // 5. Verificar estrutura da tabela
    console.log('\n5. Verificando estrutura da tabela cliente...')
    const clienteSchema = await prisma.$queryRaw`
      DESCRIBE cliente
    `
    console.log('Estrutura da tabela cliente:')
    clienteSchema.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`)
    })
    
    // 6. Verificar constraints únicos
    console.log('\n6. Verificando constraints únicos...')
    const constraints = await prisma.$queryRaw`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'homeconfigurator' 
      AND TABLE_NAME = 'cliente'
    `
    console.log('Constraints da tabela cliente:')
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME}`)
    })
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    
    if (error.code === 'P2002') {
      console.error('Erro de constraint único violado')
    } else if (error.code === 'P2003') {
      console.error('Erro de foreign key violado')
    } else if (error.code === 'P2025') {
      console.error('Registo não encontrado')
    }
    
    console.error('Stack trace:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testClientesAPI()
  .then(() => {
    console.log('\n✅ Teste concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error)
    process.exit(1)
  }) 