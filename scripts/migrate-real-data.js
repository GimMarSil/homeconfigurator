const { PrismaClient } = require('../lib/generated/prisma')

const prisma = new PrismaClient()

async function migrateRealData() {
  try {
    console.log('🚀 Iniciando migração de dados para a base de dados real...')

    // 1. Criar tipos de material
    console.log('📦 Criando tipos de material...')
    const tiposMaterial = [
      { nome: 'Revestimento de Parede', categoria: 'REVESTIMENTO', unidadeMedida: 'm²', descricao: 'Materiais para revestimento de paredes' },
      { nome: 'Revestimento de Chão', categoria: 'REVESTIMENTO', unidadeMedida: 'm²', descricao: 'Materiais para revestimento de pavimentos' },
      { nome: 'Pintura Interior', categoria: 'PINTURA', unidadeMedida: 'L', descricao: 'Tintas para interior' },
      { nome: 'Pintura Exterior', categoria: 'PINTURA', unidadeMedida: 'L', descricao: 'Tintas para exterior' },
      { nome: 'Iluminação LED', categoria: 'ILUMINACAO', unidadeMedida: 'un', descricao: 'Lâmpadas e luminárias LED' },
      { nome: 'Mobiliário de Cozinha', categoria: 'MOBILIARIO', unidadeMedida: 'un', descricao: 'Móveis para cozinha' },
      { nome: 'Mobiliário de Casa de Banho', categoria: 'MOBILIARIO', unidadeMedida: 'un', descricao: 'Móveis para casa de banho' },
      { nome: 'Sanitários', categoria: 'SANITARIOS', unidadeMedida: 'un', descricao: 'Sanitários e acessórios' },
      { nome: 'Electrodomésticos', categoria: 'COZINHA', unidadeMedida: 'un', descricao: 'Electrodomésticos para cozinha' },
      { nome: 'Outros', categoria: 'OUTROS', unidadeMedida: 'un', descricao: 'Outros materiais' }
    ]

    for (const tipo of tiposMaterial) {
      await prisma.tipoMaterial.upsert({
        where: { nome: tipo.nome },
        update: tipo,
        create: tipo
      })
    }

    // 2. Criar tipos de zona
    console.log('🏠 Criando tipos de zona...')
    const tiposZona = [
      { nome: 'Sala de Estar', categoria: 'HABITACIONAL', descricao: 'Zona de convívio e entretenimento' },
      { nome: 'Cozinha', categoria: 'HABITACIONAL', descricao: 'Zona de preparação de refeições' },
      { nome: 'Quarto Principal', categoria: 'HABITACIONAL', descricao: 'Quarto do casal' },
      { nome: 'Quarto Secundário', categoria: 'HABITACIONAL', descricao: 'Quartos adicionais' },
      { nome: 'Casa de Banho', categoria: 'SERVICOS', descricao: 'Casa de banho completa' },
      { nome: 'WC', categoria: 'SERVICOS', descricao: 'Casa de banho apenas com WC' },
      { nome: 'Hall de Entrada', categoria: 'CIRCULACAO', descricao: 'Zona de entrada' },
      { nome: 'Corredor', categoria: 'CIRCULACAO', descricao: 'Zona de circulação' },
      { nome: 'Varanda', categoria: 'EXTERIOR', descricao: 'Zona exterior' },
      { nome: 'Garagem', categoria: 'TECNICO', descricao: 'Zona de estacionamento' }
    ]

    for (const tipo of tiposZona) {
      await prisma.zonaTipo.upsert({
        where: { nome: tipo.nome },
        update: tipo,
        create: tipo
      })
    }

    // 3. Criar materiais globais
    console.log('🛠️ Criando materiais globais...')
    const materiaisGlobais = [
      {
        nome: 'Azulejo Branco 20x20',
        referencia: 'AZ001',
        marca: 'Cerâmica Nacional',
        descricao: 'Azulejo branco liso 20x20cm para paredes',
        precoUnitario: 12.50,
        fornecedor: 'Leroy Merlin',
        urlFabricante: 'https://www.leroymerlin.pt',
        tipoMaterialId: 1,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Pavimento Laminado Carvalho',
        referencia: 'PAV001',
        marca: 'Quick-Step',
        descricao: 'Pavimento laminado imitação carvalho',
        precoUnitario: 18.90,
        fornecedor: 'Leroy Merlin',
        urlFabricante: 'https://www.quick-step.pt',
        tipoMaterialId: 2,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Tinta Branca Interior',
        referencia: 'TINT001',
        marca: 'CIN',
        descricao: 'Tinta branca para interior, 5L',
        precoUnitario: 25.00,
        fornecedor: 'Leroy Merlin',
        urlFabricante: 'https://www.cin.pt',
        tipoMaterialId: 3,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Lâmpada LED 9W',
        referencia: 'LED001',
        marca: 'Philips',
        descricao: 'Lâmpada LED 9W, equivalente a 60W',
        precoUnitario: 3.50,
        fornecedor: 'Leroy Merlin',
        urlFabricante: 'https://www.philips.pt',
        tipoMaterialId: 5,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Móvel de Cozinha Base',
        referencia: 'MOB001',
        marca: 'IKEA',
        descricao: 'Móvel base para cozinha, 60cm',
        precoUnitario: 89.90,
        fornecedor: 'IKEA',
        urlFabricante: 'https://www.ikea.pt',
        tipoMaterialId: 6,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Sanitário Suspenso',
        referencia: 'SAN001',
        marca: 'Roca',
        descricao: 'Sanitário suspenso com caixa de descarga',
        precoUnitario: 299.00,
        fornecedor: 'Leroy Merlin',
        urlFabricante: 'https://www.roca.pt',
        tipoMaterialId: 8,
        isGlobal: true,
        aprovado: true
      },
      {
        nome: 'Frigorífico Combi',
        referencia: 'ELEC001',
        marca: 'Bosch',
        descricao: 'Frigorífico combi 60cm, classe A+++',
        precoUnitario: 599.00,
        fornecedor: 'Worten',
        urlFabricante: 'https://www.bosch-home.pt',
        tipoMaterialId: 9,
        isGlobal: true,
        aprovado: true
      }
    ]

    for (const material of materiaisGlobais) {
      await prisma.material.upsert({
        where: { referencia: material.referencia },
        update: material,
        create: material
      })
    }

    // 4. Criar cliente de exemplo
    console.log('👥 Criando cliente de exemplo...')
    const cliente = await prisma.cliente.upsert({
      where: { email: 'exemplo@empresa.pt' },
      update: {},
      create: {
        nome: 'Empresa Exemplo Lda',
        email: 'exemplo@empresa.pt',
        telefone: '+351 123 456 789',
        morada: 'Rua das Flores, 123',
        nif: '123456789',
        descricao: 'Empresa de construção civil',
        status: 'ATIVO',
        plano: 'PROFISSIONAL',
        maxEdificios: 20,
        maxUtilizadores: 50
      }
    })

    // 5. Criar utilizadores de exemplo
    console.log('👤 Criando utilizadores de exemplo...')
    const utilizadoresData = [
      {
        nome: 'João Silva',
        email: 'joao@empresa.pt',
        telefone: '+351 123 456 790',
        password: '$2b$10$example.hash', // Em produção seria hash real
        role: 'ADMIN',
        status: 'ATIVO',
        clienteId: cliente.id
      },
      {
        nome: 'Maria Santos',
        email: 'maria@empresa.pt',
        telefone: '+351 123 456 791',
        password: '$2b$10$example.hash',
        role: 'GESTOR',
        status: 'ATIVO',
        clienteId: cliente.id
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@empresa.pt',
        telefone: '+351 123 456 792',
        password: '$2b$10$example.hash',
        role: 'VISUALIZADOR',
        status: 'ATIVO',
        clienteId: cliente.id
      }
    ]

    const utilizadores = []
    for (const utilizador of utilizadoresData) {
      const user = await prisma.utilizador.upsert({
        where: { email: utilizador.email },
        update: utilizador,
        create: utilizador
      })
      utilizadores.push(user)
    }

    // 6. Criar edifício de exemplo
    console.log('🏢 Criando edifício de exemplo...')
    let edificio = await prisma.edificio.findFirst({
      where: { 
        nome: 'Residencial Sol Nascente',
        clienteId: cliente.id
      }
    })

    if (!edificio) {
      edificio = await prisma.edificio.create({
        data: {
          nome: 'Residencial Sol Nascente',
          morada: 'Rua do Sol, 456',
          codigoPostal: '1000-001',
          cidade: 'Lisboa',
          tipologia: 'Residencial',
          nPisos: 3,
          areaBruta: 450.0,
          anoConstrucao: 2024,
          estado: 'EM_CURSO',
          descricao: 'Edifício residencial com 6 apartamentos',
          prazoExecucao: new Date('2025-06-30'),
          orcamentoTotal: 750000.0,
          clienteId: cliente.id
        }
      })
    }

    // 7. Criar zonas do edifício
    console.log('🏠 Criando zonas do edifício...')
    const zonas = [
      {
        nome: 'Apartamento T1 - Piso 1',
        descricao: 'Apartamento tipo T1 no primeiro piso',
        area: 75.0,
        pe: 2.7,
        estado: 'EM_PROGRESSO',
        estadoAprovacao: 'APROVADO',
        orcamentoEstimado: 125000.0,
        zonaTipoId: 1, // Sala de Estar
        edificioId: edificio.id
      },
      {
        nome: 'Cozinha - Piso 1',
        descricao: 'Cozinha do apartamento T1',
        area: 12.0,
        pe: 2.7,
        estado: 'PENDENTE',
        estadoAprovacao: 'RASCUNHO',
        orcamentoEstimado: 25000.0,
        zonaTipoId: 2, // Cozinha
        edificioId: edificio.id
      },
      {
        nome: 'Casa de Banho - Piso 1',
        descricao: 'Casa de banho do apartamento T1',
        area: 6.0,
        pe: 2.7,
        estado: 'PENDENTE',
        estadoAprovacao: 'RASCUNHO',
        orcamentoEstimado: 15000.0,
        zonaTipoId: 5, // Casa de Banho
        edificioId: edificio.id
      }
    ]

    for (const zona of zonas) {
      const zonaExistente = await prisma.zonaEspecifica.findFirst({
        where: { 
          nome: zona.nome,
          edificioId: zona.edificioId
        }
      })

      if (!zonaExistente) {
        await prisma.zonaEspecifica.create({
          data: zona
        })
      }
    }

    // 8. Criar materiais personalizados do cliente
    console.log('🎨 Criando materiais personalizados...')
    const materiaisPersonalizados = [
      {
        nome: 'Azulejo Personalizado Verde',
        referencia: 'AZ-VERDE-001',
        marca: 'Cerâmica Nacional',
        descricao: 'Azulejo verde personalizado para o projeto',
        precoUnitario: 18.50,
        fornecedor: 'Leroy Merlin',
        tipoMaterialId: 1,
        isGlobal: false,
        aprovado: true,
        clienteId: cliente.id
      },
      {
        nome: 'Pavimento Madeira Exótica',
        referencia: 'PAV-EXOT-001',
        marca: 'Quick-Step',
        descricao: 'Pavimento imitação madeira exótica',
        precoUnitario: 28.90,
        fornecedor: 'Leroy Merlin',
        tipoMaterialId: 2,
        isGlobal: false,
        aprovado: true,
        clienteId: cliente.id
      }
    ]

    for (const material of materiaisPersonalizados) {
      await prisma.material.upsert({
        where: { referencia: material.referencia },
        update: material,
        create: material
      })
    }

    // 9. Criar seleções de materiais nas zonas
    console.log('📋 Criando seleções de materiais...')
    const materiaisGlobaisDB = await prisma.material.findMany({ where: { isGlobal: true } })
    const materiaisPersonalizadosDB = await prisma.material.findMany({ where: { clienteId: cliente.id } })
    const zonasDB = await prisma.zonaEspecifica.findMany({ where: { edificioId: edificio.id } })

    const selecoes = [
      {
        materialId: materiaisGlobaisDB[0].id, // Azulejo branco
        zonaId: zonasDB[0].id, // Apartamento T1
        quantidade: 45.0,
        precoUnitario: 12.50,
        observacoes: 'Para revestimento das paredes da sala'
      },
      {
        materialId: materiaisGlobaisDB[1].id, // Pavimento laminado
        zonaId: zonasDB[0].id, // Apartamento T1
        quantidade: 75.0,
        precoUnitario: 18.90,
        observacoes: 'Para pavimento da sala'
      },
      {
        materialId: materiaisPersonalizadosDB[0].id, // Azulejo verde personalizado
        zonaId: zonasDB[1].id, // Cozinha
        quantidade: 25.0,
        precoUnitario: 18.50,
        observacoes: 'Para revestimento da cozinha'
      }
    ]

    for (const selecao of selecoes) {
      await prisma.materialSelecionado.upsert({
        where: {
          materialId_zonaId: {
            materialId: selecao.materialId,
            zonaId: selecao.zonaId
          }
        },
        update: selecao,
        create: selecao
      })
    }

    // 10. Criar comentários de exemplo
    console.log('💬 Criando comentários de exemplo...')
    const comentarios = [
      {
        conteudo: 'Gostaria de confirmar se os azulejos verdes são resistentes à humidade para a cozinha.',
        tipo: 'DUVIDA',
        prioridade: 'NORMAL',
        zonaId: zonasDB[1].id, // Cozinha
        clienteId: cliente.id,
        utilizadorId: utilizadores[1].id // Maria Santos
      },
      {
        conteudo: 'Sugiro alterar o pavimento da sala para um tom mais escuro.',
        tipo: 'SUGESTAO',
        prioridade: 'BAIXA',
        zonaId: zonasDB[0].id, // Apartamento T1
        clienteId: cliente.id,
        utilizadorId: utilizadores[1].id // Maria Santos
      }
    ]

    for (const comentario of comentarios) {
      await prisma.comentario.create({
        data: comentario
      })
    }

    // 11. Criar notificações de exemplo
    console.log('🔔 Criando notificações de exemplo...')
    const notificacoes = [
      {
        titulo: 'Novo material aprovado',
        mensagem: 'O material "Azulejo Personalizado Verde" foi aprovado.',
        tipo: 'APROVACAO',
        clienteId: cliente.id,
        materialId: materiaisPersonalizadosDB[0].id
      },
      {
        titulo: 'Comentário novo',
        mensagem: 'Maria Santos adicionou um comentário na zona "Cozinha - Piso 1".',
        tipo: 'COMENTARIO',
        clienteId: cliente.id,
        zonaId: zonasDB[1].id
      }
    ]

    for (const notificacao of notificacoes) {
      await prisma.notificacao.create({
        data: {
          ...notificacao,
          remetenteId: utilizadores[1].id // Maria Santos
        }
      })
    }

    console.log('✅ Migração concluída com sucesso!')
    console.log('\n📊 Resumo da migração:')
    console.log(`- ${tiposMaterial.length} tipos de material criados`)
    console.log(`- ${tiposZona.length} tipos de zona criados`)
    console.log(`- ${materiaisGlobais.length} materiais globais criados`)
    console.log(`- 1 cliente criado: ${cliente.nome}`)
    console.log(`- ${utilizadores.length} utilizadores criados`)
    console.log(`- 1 edifício criado: ${edificio.nome}`)
    console.log(`- ${zonas.length} zonas criadas`)
    console.log(`- ${materiaisPersonalizados.length} materiais personalizados criados`)
    console.log(`- ${selecoes.length} seleções de materiais criadas`)
    console.log(`- ${comentarios.length} comentários criados`)
    console.log(`- ${notificacoes.length} notificações criadas`)

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a migração
migrateRealData()
  .then(() => {
    console.log('🎉 Migração finalizada com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal durante a migração:', error)
    process.exit(1)
  })
