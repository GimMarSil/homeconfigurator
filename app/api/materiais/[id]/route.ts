import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/materiais/[id] - Buscar material específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        tipoMaterial: true,
        ficheiros: {
          orderBy: { criadoEm: 'desc' }
        },
        materiaisSelecionados: {
          include: {
            zona: {
              include: {
                edificio: {
                  include: {
                    cliente: {
                      select: {
                        id: true,
                        nome: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('Erro ao buscar material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/materiais/[id] - Atualizar material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      nome,
      referencia,
      marca,
      descricao,
      precoUnitario,
      fornecedor,
      urlFabricante,
      imagem,
      fichaTecnica,
      disponivel,
      tipoMaterialId,
    } = body

    // Verificar se material existe
    const materialExistente = await prisma.material.findUnique({
      where: { id },
    })

    if (!materialExistente) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se tipo de material existe (se fornecido)
    if (tipoMaterialId) {
      const tipoMaterial = await prisma.tipoMaterial.findUnique({
        where: { id: parseInt(tipoMaterialId) },
      })

      if (!tipoMaterial) {
        return NextResponse.json(
          { error: 'Tipo de material não encontrado' },
          { status: 400 }
        )
      }
    }

    const materialAtualizado = await prisma.material.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(referencia !== undefined && { referencia: referencia || null }),
        ...(marca !== undefined && { marca: marca || null }),
        ...(descricao !== undefined && { descricao: descricao || null }),
        ...(precoUnitario !== undefined && { precoUnitario: parseFloat(precoUnitario) || 0 }),
        ...(fornecedor !== undefined && { fornecedor: fornecedor || null }),
        ...(urlFabricante !== undefined && { urlFabricante: urlFabricante || null }),
        ...(imagem !== undefined && { imagem: imagem || null }),
        ...(fichaTecnica !== undefined && { fichaTecnica: fichaTecnica || null }),
        ...(disponivel !== undefined && { disponivel }),
        ...(tipoMaterialId && { tipoMaterialId: parseInt(tipoMaterialId) }),
      },
      include: {
        tipoMaterial: true,
      },
    })

    return NextResponse.json(materialAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/materiais/[id] - Eliminar material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar se material existe
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        materiaisSelecionados: {
          select: { 
            id: true,
            zona: { 
              select: { 
                nome: true, 
                edificio: { select: { nome: true } } 
              } 
            }
          }
        },
        zonaTipoMateriais: { select: { id: true } },
        ficheiros: { select: { id: true } },
        comentarios: { select: { id: true } },
        tipoMaterial: { select: { nome: true } },
        cliente: { select: { nome: true } }
      },
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se foi solicitada eliminação forçada
    const url = new URL(request.url)
    const forceDelete = url.searchParams.get('force') === 'true'
    const cascadeDelete = url.searchParams.get('cascade') === 'true'

    // Verificar se material está sendo usado (proteção de integridade referencial)
    const problems = []
    
    if (material.materiaisSelecionados.length > 0) {
      const exemplosZonas = material.materiaisSelecionados.slice(0, 3)
        .map(ms => `${ms.zona.nome} (${ms.zona.edificio?.nome})`)
        .join(', ')
      
      problems.push(`Selecionado em ${material.materiaisSelecionados.length} zonas`)
      problems.push(`Exemplos: ${exemplosZonas}${material.materiaisSelecionados.length > 3 ? '...' : ''}`)
    }

    if (material.zonaTipoMateriais.length > 0) {
      problems.push(`Associado a ${material.zonaTipoMateriais.length} tipos de zona`)
    }

    if (material.ficheiros.length > 0) {
      problems.push(`${material.ficheiros.length} ficheiros associados`)
    }

    if (material.comentarios.length > 0) {
      problems.push(`${material.comentarios.length} comentários associados`)
    }

    // Se há problemas e não foi solicitada eliminação forçada, retornar erro
    if (problems.length > 0 && !forceDelete && !cascadeDelete) {
      return NextResponse.json(
        { 
          error: `Não é possível eliminar o material "${material.nome}".`,
          details: problems.join('. '),
          suggestion: 'Use ?force=true para eliminar forçadamente ou ?cascade=true para eliminar em cascata.',
          constraint: 'REFERENTIAL_INTEGRITY',
          context: `Tipo: ${material.tipoMaterial?.nome}, Cliente: ${material.cliente?.nome || 'Global'}`,
          relatedCounts: {
            materiaisSelecionados: material.materiaisSelecionados.length,
            zonaTipoMateriais: material.zonaTipoMateriais.length,
            ficheiros: material.ficheiros.length,
            comentarios: material.comentarios.length
          }
        },
        { status: 409 } // Conflict
      )
    }

    // Se foi solicitada eliminação em cascata, eliminar registros relacionados primeiro
    if (cascadeDelete) {
      console.log(`🗑️ Eliminando material ${material.nome} (ID: ${id}) em cascata...`)
      
      // Eliminar em transação para garantir consistência
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar materiais selecionados
        if (material.materiaisSelecionados.length > 0) {
          console.log(`   - Eliminando ${material.materiaisSelecionados.length} materiais selecionados`)
          await tx.materialSelecionado.deleteMany({
            where: { materialId: id }
          })
        }

        // 2. Eliminar associações com tipos de zona
        if (material.zonaTipoMateriais.length > 0) {
          console.log(`   - Eliminando ${material.zonaTipoMateriais.length} associações com tipos de zona`)
          await tx.zonaTipoMaterial.deleteMany({
            where: { materialId: id }
          })
        }

        // 3. Eliminar comentários
        if (material.comentarios.length > 0) {
          console.log(`   - Eliminando ${material.comentarios.length} comentários`)
          await tx.comentario.deleteMany({
            where: { materialId: id }
          })
        }

        // 4. Eliminar ficheiros (e arquivos físicos se possível)
        if (material.ficheiros.length > 0) {
          console.log(`   - Eliminando ${material.ficheiros.length} ficheiros`)
          
          // Buscar caminhos dos ficheiros para eliminação física
          const ficheiros = await tx.ficheiro.findMany({
            where: { materialId: id },
            select: { caminho: true }
          })
          
          // Eliminar registros da base de dados
          await tx.ficheiro.deleteMany({
            where: { materialId: id }
          })
          
          // Tentar eliminar arquivos físicos (opcional)
          for (const ficheiro of ficheiros) {
            try {
              const fs = require('fs')
              const path = require('path')
              const filePath = path.join(process.cwd(), 'public', ficheiro.caminho)
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                console.log(`     - Arquivo físico eliminado: ${ficheiro.caminho}`)
              }
            } catch (e) {
              console.log(`     - Não foi possível eliminar arquivo físico: ${ficheiro.caminho}`)
            }
          }
        }

        // 5. Finalmente, eliminar o material
        console.log(`   - Eliminando material`)
        await tx.material.delete({
          where: { id }
        })
      })

      console.log(`✅ Material "${material.nome}" eliminado com sucesso em cascata`)
      return NextResponse.json({ 
        message: 'Material eliminado com sucesso em cascata',
        details: `Eliminados: ${material.materiaisSelecionados.length} seleções, ${material.zonaTipoMateriais.length} tipos de zona, ${material.ficheiros.length} ficheiros, ${material.comentarios.length} comentários`
      })
    }

    // Se foi solicitada eliminação forçada, usar deleteMany para ignorar constraints
    if (forceDelete) {
      console.log(`⚠️ Eliminando material ${material.nome} (ID: ${id}) forçadamente...`)
      
      // Usar deleteMany para ignorar constraints do Prisma
      const result = await prisma.material.deleteMany({
        where: { id }
      })

      if (result.count === 0) {
        return NextResponse.json(
          { error: 'Material não foi eliminado' },
          { status: 500 }
        )
      }

      console.log(`✅ Material "${material.nome}" eliminado forçadamente`)
      return NextResponse.json({ 
        message: 'Material eliminado forçadamente',
        warning: 'Alguns registros relacionados podem ter ficado órfãos'
      })
    }

    // Eliminação normal (sem problemas de integridade)
    await prisma.material.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Material eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar material:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 