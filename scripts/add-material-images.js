const { PrismaClient } = require('../lib/generated/prisma')
const path = require('path')
const fs = require('fs')

async function addMaterialImages() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://hc_admin:MAWmqrcdr1.1@192.168.1.116:3306/homeconfigurator"
      }
    }
  })

  try {
    console.log('🖼️  Adicionando imagens de exemplo aos materiais...\n')

    // Buscar todos os materiais
    const materiais = await prisma.material.findMany({
      take: 5 // Apenas os primeiros 5 para teste
    })

    console.log(`📋 Encontrados ${materiais.length} materiais para adicionar imagens\n`)

    for (const material of materiais) {
      console.log(`🔧 Processando material: ${material.nome}`)

      // Criar algumas imagens de exemplo para cada material
      const imagensExemplo = [
        {
          nomeOriginal: `${material.nome}_1.jpg`,
          nomeArquivo: `material_${material.id}_1_exemplo.jpg`,
          caminho: `/uploads/materiais/material_${material.id}_1_exemplo.jpg`,
          tamanho: 1024000,
          tipoMime: 'image/jpeg',
          categoria: 'IMAGEM_MATERIAL',
          descricao: `Imagem principal do ${material.nome}`,
          materialId: material.id
        },
        {
          nomeOriginal: `${material.nome}_2.jpg`,
          nomeArquivo: `material_${material.id}_2_exemplo.jpg`,
          caminho: `/uploads/materiais/material_${material.id}_2_exemplo.jpg`,
          tamanho: 856000,
          tipoMime: 'image/jpeg',
          categoria: 'IMAGEM_MATERIAL',
          descricao: `Vista detalhada do ${material.nome}`,
          materialId: material.id
        },
        {
          nomeOriginal: `${material.nome}_3.jpg`,
          nomeArquivo: `material_${material.id}_3_exemplo.jpg`,
          caminho: `/uploads/materiais/material_${material.id}_3_exemplo.jpg`,
          tamanho: 742000,
          tipoMime: 'image/jpeg',
          categoria: 'IMAGEM_MATERIAL',
          descricao: `Instalação do ${material.nome}`,
          materialId: material.id
        }
      ]

      // Verificar quantas imagens já existem
      const imagensExistentes = await prisma.ficheiro.count({
        where: {
          materialId: material.id,
          categoria: 'IMAGEM_MATERIAL'
        }
      })

      if (imagensExistentes > 0) {
        console.log(`   ⚠️  Material já tem ${imagensExistentes} imagens, pulando...`)
        continue
      }

      // Adicionar imagens à base de dados
      for (const imagem of imagensExemplo) {
        await prisma.ficheiro.create({
          data: imagem
        })
        console.log(`   ✅ Imagem adicionada: ${imagem.nomeOriginal}`)
      }

      console.log(`   📊 Total: ${imagensExemplo.length} imagens adicionadas`)
      console.log('')
    }

    // Estatísticas finais
    const totalImagens = await prisma.ficheiro.count({
      where: { categoria: 'IMAGEM_MATERIAL' }
    })

    const materiaisComImagens = await prisma.material.count({
      where: {
        ficheiros: {
          some: {
            categoria: 'IMAGEM_MATERIAL'
          }
        }
      }
    })

    console.log('📊 ESTATÍSTICAS FINAIS:')
    console.log(`   Total de imagens de materiais: ${totalImagens}`)
    console.log(`   Materiais com imagens: ${materiaisComImagens}`)
    console.log('')

    console.log('🎨 NOTAS IMPORTANTES:')
    console.log('   - As imagens são apenas registos na base de dados')
    console.log('   - Para teste, use imagens reais ou coloque placeholder.jpg na pasta public/')
    console.log('   - O carrossel irá mostrar "Sem imagens" se os ficheiros não existirem fisicamente')
    console.log('   - Para adicionar imagens reais, use a funcionalidade de upload na interface')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMaterialImages()
  .then(() => {
    console.log('\n🎉 Processo concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  }) 