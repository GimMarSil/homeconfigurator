const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedConfigurationData() {
  try {
    console.log('🌱 Iniciando seed de dados de configuração...')

    // Dados iniciais para tipos de material
    const tiposMaterial = [
      {
        nome: 'Tinta Acrílica',
        categoria: 'ACABAMENTOS',
        unidadeMedida: 'L',
        descricao: 'Tinta acrílica para paredes interiores e exteriores'
      },
      {
        nome: 'Tinta Plástica',
        categoria: 'ACABAMENTOS',
        unidadeMedida: 'L',
        descricao: 'Tinta plástica lavável para interiores'
      },
      {
        nome: 'Tijolo Cerâmico',
        categoria: 'ESTRUTURA',
        unidadeMedida: 'un',
        descricao: 'Tijolo cerâmico para alvenaria estrutural'
      },
      {
        nome: 'Betão Armado',
        categoria: 'ESTRUTURA',
        unidadeMedida: 'm³',
        descricao: 'Betão com armadura de ferro para estruturas'
      },
      {
        nome: 'Cerâmica de Parede',
        categoria: 'REVESTIMENTO',
        unidadeMedida: 'm²',
        descricao: 'Cerâmica para revestimento de paredes'
      },
      {
        nome: 'Cerâmica de Chão',
        categoria: 'REVESTIMENTO',
        unidadeMedida: 'm²',
        descricao: 'Cerâmica antiderrapante para pavimentos'
      },
      {
        nome: 'Isolamento Térmico',
        categoria: 'ISOLAMENTO',
        unidadeMedida: 'm²',
        descricao: 'Material isolante térmico e acústico'
      },
      {
        nome: 'Lã de Rocha',
        categoria: 'ISOLAMENTO',
        unidadeMedida: 'm²',
        descricao: 'Isolamento térmico e acústico em lã de rocha'
      },
      {
        nome: 'Tubo PVC',
        categoria: 'INSTALACOES',
        unidadeMedida: 'm',
        descricao: 'Tubagem PVC para instalações sanitárias'
      },
      {
        nome: 'Cabo Elétrico',
        categoria: 'INSTALACOES',
        unidadeMedida: 'm',
        descricao: 'Cabo elétrico para instalações elétricas'
      },
      {
        nome: 'Pavimento Laminado',
        categoria: 'ACABAMENTOS',
        unidadeMedida: 'm²',
        descricao: 'Pavimento laminado imitação madeira'
      },
      {
        nome: 'Porta Interior',
        categoria: 'ACABAMENTOS',
        unidadeMedida: 'un',
        descricao: 'Porta de madeira para interiores'
      },
      {
        nome: 'Janela PVC',
        categoria: 'ACABAMENTOS',
        unidadeMedida: 'un',
        descricao: 'Janela em PVC com vidro duplo'
      },
      {
        nome: 'Papel de Parede',
        categoria: 'DECORACAO',
        unidadeMedida: 'm²',
        descricao: 'Papel de parede decorativo lavável'
      },
      {
        nome: 'Luminária LED',
        categoria: 'DECORACAO',
        unidadeMedida: 'un',
        descricao: 'Luminária LED de baixo consumo'
      }
    ]

    // Dados iniciais para tipos de zona
    const tiposZona = [
      {
        nome: 'Sala de Estar',
        categoria: 'RESIDENCIAL',
        descricao: 'Espaço principal de convívio familiar'
      },
      {
        nome: 'Cozinha',
        categoria: 'RESIDENCIAL',
        descricao: 'Área de preparação e confeção de alimentos'
      },
      {
        nome: 'Quarto Casal',
        categoria: 'RESIDENCIAL',
        descricao: 'Quarto principal para casal'
      },
      {
        nome: 'Quarto Individual',
        categoria: 'RESIDENCIAL',
        descricao: 'Quarto para uma pessoa'
      },
      {
        nome: 'Casa de Banho Completa',
        categoria: 'RESIDENCIAL',
        descricao: 'Casa de banho com banheira ou duche'
      },
      {
        nome: 'Casa de Banho Social',
        categoria: 'RESIDENCIAL',
        descricao: 'Casa de banho de apoio social'
      },
      {
        nome: 'Hall de Entrada',
        categoria: 'RESIDENCIAL',
        descricao: 'Área de entrada da habitação'
      },
      {
        nome: 'Corredor',
        categoria: 'RESIDENCIAL',
        descricao: 'Circulação interior da habitação'
      },
      {
        nome: 'Varanda',
        categoria: 'RESIDENCIAL',
        descricao: 'Espaço exterior coberto'
      },
      {
        nome: 'Terraço',
        categoria: 'RESIDENCIAL',
        descricao: 'Espaço exterior descoberto'
      },
      {
        nome: 'Garagem',
        categoria: 'RESIDENCIAL',
        descricao: 'Espaço para estacionamento de veículos'
      },
      {
        nome: 'Arrecadação',
        categoria: 'RESIDENCIAL',
        descricao: 'Espaço de arrumação e armazenamento'
      },
      {
        nome: 'Escritório',
        categoria: 'COMERCIAL',
        descricao: 'Espaço de trabalho administrativo'
      },
      {
        nome: 'Loja',
        categoria: 'COMERCIAL',
        descricao: 'Espaço comercial de venda ao público'
      },
      {
        nome: 'Restaurante',
        categoria: 'COMERCIAL',
        descricao: 'Espaço de restauração e bebidas'
      },
      {
        nome: 'Café/Bar',
        categoria: 'COMERCIAL',
        descricao: 'Estabelecimento de bebidas e snacks'
      },
      {
        nome: 'Sala de Reuniões',
        categoria: 'COMERCIAL',
        descricao: 'Espaço para reuniões empresariais'
      },
      {
        nome: 'Receção',
        categoria: 'COMERCIAL',
        descricao: 'Área de atendimento ao público'
      },
      {
        nome: 'Armazém',
        categoria: 'INDUSTRIAL',
        descricao: 'Espaço para armazenamento de mercadorias'
      },
      {
        nome: 'Oficina',
        categoria: 'INDUSTRIAL',
        descricao: 'Espaço de produção e manufactura'
      },
      {
        nome: 'Laboratório',
        categoria: 'INDUSTRIAL',
        descricao: 'Espaço para investigação e testes'
      },
      {
        nome: 'Sala de Aula',
        categoria: 'PUBLICA',
        descricao: 'Espaço educativo para ensino'
      },
      {
        nome: 'Biblioteca',
        categoria: 'PUBLICA',
        descricao: 'Espaço de consulta e estudo'
      },
      {
        nome: 'Auditório',
        categoria: 'PUBLICA',
        descricao: 'Espaço para eventos e apresentações'
      },
      {
        nome: 'Consultório Médico',
        categoria: 'PUBLICA',
        descricao: 'Espaço para consultas médicas'
      },
      {
        nome: 'Residencial/Comercial',
        categoria: 'MISTA',
        descricao: 'Espaço com uso residencial e comercial'
      },
      {
        nome: 'Loft',
        categoria: 'MISTA',
        descricao: 'Espaço aberto multifuncional'
      },
      {
        nome: 'Estúdio',
        categoria: 'MISTA',
        descricao: 'Espaço de trabalho criativo'
      }
    ]

    // Inserir tipos de material
    console.log('📦 Inserindo tipos de material...')
    for (const tipo of tiposMaterial) {
      const existe = await prisma.tipoMaterial.findFirst({
        where: { nome: tipo.nome }
      })

      if (!existe) {
        await prisma.tipoMaterial.create({ data: tipo })
        console.log(`✅ Tipo de material criado: ${tipo.nome}`)
      } else {
        console.log(`⏭️  Tipo de material já existe: ${tipo.nome}`)
      }
    }

    // Inserir tipos de zona
    console.log('🏠 Inserindo tipos de zona...')
    for (const tipo of tiposZona) {
      const existe = await prisma.zonaTipo.findFirst({
        where: { nome: tipo.nome }
      })

      if (!existe) {
        await prisma.zonaTipo.create({ data: tipo })
        console.log(`✅ Tipo de zona criado: ${tipo.nome}`)
      } else {
        console.log(`⏭️  Tipo de zona já existe: ${tipo.nome}`)
      }
    }

    // Estatísticas finais
    const totalTiposMaterial = await prisma.tipoMaterial.count()
    const totalTiposZona = await prisma.zonaTipo.count()

    console.log('\n📊 Estatísticas finais:')
    console.log(`   • Tipos de Material: ${totalTiposMaterial}`)
    console.log(`   • Tipos de Zona: ${totalTiposZona}`)
    console.log('\n✅ Seed de dados de configuração concluído com sucesso!')

  } catch (error) {
    console.error('❌ Erro no seed de dados de configuração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  seedConfigurationData()
    .then(() => {
      console.log('🎉 Seed concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erro no seed:', error)
      process.exit(1)
    })
}

module.exports = { seedConfigurationData } 