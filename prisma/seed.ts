import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A semear a base de dados...')

  // Limpar dados existentes (cuidado em produção!)
  await prisma.selecaoMaterial.deleteMany()
  await prisma.zonaTipoMaterial.deleteMany()
  await prisma.zonaEspecifica.deleteMany()
  await prisma.material.deleteMany()
  await prisma.tipoMaterial.deleteMany()
  await prisma.zonaTipo.deleteMany()
  await prisma.edificio.deleteMany()
  await prisma.utilizador.deleteMany()
  await prisma.cliente.deleteMany()

  // Criar tipos de zona
  const zonasTipo = await Promise.all([
    prisma.zonaTipo.create({
      data: {
        nome: "I.S. (Instalação Sanitária)",
        categoria: "SERVICOS",
        descricao: "Casa de banho completa",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Cozinha",
        categoria: "HABITACIONAL",
        descricao: "Área de preparação de alimentos",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Quarto",
        categoria: "HABITACIONAL",
        descricao: "Quarto individual ou duplo",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Sala",
        categoria: "HABITACIONAL",
        descricao: "Sala de estar ou comum",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Circulação",
        categoria: "CIRCULACAO",
        descricao: "Corredores e halls",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Exterior",
        categoria: "EXTERIOR",
        descricao: "Áreas exteriores",
      },
    }),
    prisma.zonaTipo.create({
      data: {
        nome: "Zona Técnica",
        categoria: "TECNICO",
        descricao: "Área para equipamentos técnicos",
      },
    }),
  ])

  // Criar tipos de material
  const tiposMaterial = await Promise.all([
    prisma.tipoMaterial.create({
      data: {
        nome: "Sanita",
        categoria: "Sanitários",
        unidadeMedida: "unidade",
        descricao: "Louça sanitária",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Lavatório",
        categoria: "Sanitários",
        unidadeMedida: "unidade",
        descricao: "Lavatório de parede ou coluna",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Misturadora",
        categoria: "Sanitários",
        unidadeMedida: "unidade",
        descricao: "Torneira misturadora",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Base de duche",
        categoria: "Sanitários",
        unidadeMedida: "unidade",
        descricao: "Base de duche em acrílico ou cerâmica",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Revestimento cerâmico",
        categoria: "Revestimentos",
        unidadeMedida: "m²",
        descricao: "Azulejo para paredes",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Pavimento",
        categoria: "Pavimentos",
        unidadeMedida: "m²",
        descricao: "Pavimento interior",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Mobiliário de cozinha",
        categoria: "Mobiliário",
        unidadeMedida: "ml",
        descricao: "Móveis de cozinha por metro linear",
      },
    }),
    prisma.tipoMaterial.create({
      data: {
        nome: "Electrodomésticos",
        categoria: "Equipamentos",
        unidadeMedida: "unidade",
        descricao: "Fogão, forno, frigorífico",
      },
    }),
  ])

  // Criar materiais de exemplo
  const materiais = await Promise.all([
    // Sanitários
    prisma.material.create({
      data: {
        nome: "Sanita Suspensa Duravit",
        referencia: "DUR-001",
        marca: "Duravit",
        descricao: "Sanita suspensa em porcelana branca",
        precoUnitario: 450.00,
        fornecedor: "Sanitários Premium Lda",
        tipoMaterialId: tiposMaterial[0].id,
        disponivel: true,
      },
    }),
    prisma.material.create({
      data: {
        nome: "Lavatório Roca",
        referencia: "ROC-002",
        marca: "Roca",
        descricao: "Lavatório de semi-encastre",
        precoUnitario: 280.00,
        fornecedor: "Sanitários Premium Lda",
        tipoMaterialId: tiposMaterial[1].id,
        disponivel: true,
      },
    }),
    // Revestimentos
    prisma.material.create({
      data: {
        nome: "Cerâmica Marazzi 30x60",
        referencia: "MAR-003",
        marca: "Marazzi",
        descricao: "Cerâmica para parede em tons de cinza",
        precoUnitario: 35.50,
        fornecedor: "Cerâmicas do Norte",
        tipoMaterialId: tiposMaterial[4].id,
        disponivel: true,
      },
    }),
    // Pavimentos
    prisma.material.create({
      data: {
        nome: "Soalho Carvalho 14mm",
        referencia: "SOA-004",
        marca: "Tarkett",
        descricao: "Soalho flutuante em carvalho natural",
        precoUnitario: 42.90,
        fornecedor: "Madeiras & Pavimentos",
        tipoMaterialId: tiposMaterial[5].id,
        disponivel: true,
      },
    }),
    prisma.material.create({
      data: {
        nome: "Cerâmica Porcelanosa 60x60",
        referencia: "POR-005",
        marca: "Porcelanosa",
        descricao: "Cerâmica porcelânica imitação pedra",
        precoUnitario: 55.20,
        fornecedor: "Cerâmicas do Norte",
        tipoMaterialId: tiposMaterial[5].id,
        disponivel: true,
      },
    }),
  ])

  // Criar clientes de exemplo
  const cliente1 = await prisma.cliente.create({
    data: {
      nome: "Construções Silva Lda",
      email: "geral@construcoessilva.pt",
      telefone: "+351 912 345 678",
      morada: "Rua das Flores, 123 - 4000-001 Porto",
      nif: "123456789",
      status: "ATIVO",
    },
  })

  const cliente2 = await prisma.cliente.create({
    data: {
      nome: "Imobiliária Moderna",
      email: "contacto@imobiliariamoderna.pt",
      telefone: "+351 934 567 890",
      morada: "Av. da Liberdade, 456 - 1250-001 Lisboa",
      nif: "987654321",
      status: "ATIVO",
    },
  })

  // Criar utilizadores
  await prisma.utilizador.create({
    data: {
      nome: "João Silva",
      email: "joao@construcoessilva.pt",
      telefone: "+351 912 345 678",
      password: "123456",
      role: "ADMIN",
      status: "ATIVO",
      clienteId: cliente1.id,
    },
  })

  await prisma.utilizador.create({
    data: {
      nome: "Maria Santos",
      email: "maria@imobiliariamoderna.pt",
      telefone: "+351 934 567 890",
      password: "123456",
      role: "GESTOR",
      status: "ATIVO",
      clienteId: cliente2.id,
    },
  })

  // Criar edifícios de exemplo
  const edificio1 = await prisma.edificio.create({
    data: {
      nome: "Residencial Quinta do Sol",
      morada: "Quinta do Sol, Lote 15 - 4100-001 Porto",
      tipologia: "T3",
      nPisos: 2,
      areaBruta: 150.5,
      anoConstrucao: 2024,
      estado: "EM_CURSO",
      clienteId: cliente1.id,
    },
  })

  const edificio2 = await prisma.edificio.create({
    data: {
      nome: "Apartamento City Center",
      morada: "Rua Augusta, 789 - 1100-001 Lisboa",
      tipologia: "T2",
      nPisos: 1,
      areaBruta: 95.0,
      anoConstrucao: 2023,
      estado: "FINALIZADO",
      clienteId: cliente2.id,
    },
  })

  // Criar zonas específicas
  await prisma.zonaEspecifica.create({
    data: {
      nome: "I.S. Suite Principal",
      area: 8.5,
      estado: "EM_PROGRESSO",
      zonaTipoId: zonasTipo[0].id, // I.S.
      edificioId: edificio1.id,
    },
  })

  await prisma.zonaEspecifica.create({
    data: {
      nome: "Cozinha Open Space",
      area: 15.2,
      estado: "PENDENTE",
      zonaTipoId: zonasTipo[1].id, // Cozinha
      edificioId: edificio1.id,
    },
  })

  await prisma.zonaEspecifica.create({
    data: {
      nome: "Sala de Estar",
      area: 25.8,
      estado: "CONCLUIDO",
      zonaTipoId: zonasTipo[3].id, // Sala
      edificioId: edificio2.id,
    },
  })

  // Relacionar zonas com materiais permitidos (exemplo)
  await prisma.zonaTipoMaterial.createMany({
    data: [
      // I.S. pode usar sanitários e revestimentos
      { zonaTipoId: zonasTipo[0].id, materialId: materiais[0].id }, // Sanita
      { zonaTipoId: zonasTipo[0].id, materialId: materiais[1].id }, // Lavatório
      { zonaTipoId: zonasTipo[0].id, materialId: materiais[2].id }, // Cerâmica parede
      
      // Sala/Quarto podem usar pavimentos
      { zonaTipoId: zonasTipo[2].id, materialId: materiais[3].id }, // Soalho
      { zonaTipoId: zonasTipo[2].id, materialId: materiais[4].id }, // Cerâmica chão
      { zonaTipoId: zonasTipo[3].id, materialId: materiais[3].id }, // Soalho
      { zonaTipoId: zonasTipo[3].id, materialId: materiais[4].id }, // Cerâmica chão
    ],
  })

  console.log('✅ Base de dados populada com sucesso!')
  console.log(`📊 Criados:
  - ${zonasTipo.length} tipos de zona
  - ${tiposMaterial.length} tipos de material  
  - ${materiais.length} materiais
  - 2 clientes
  - 2 utilizadores
  - 2 edifícios
  - 3 zonas específicas`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 