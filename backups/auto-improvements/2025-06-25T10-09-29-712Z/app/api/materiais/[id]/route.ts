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

    if (problems.length > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível eliminar o material "${material.nome}".`,
          details: problems.join('. '),
          suggestion: 'Remova primeiro o material de todas as zonas onde está selecionado.',
          constraint: 'REFERENTIAL_INTEGRITY',
          context: `Tipo: ${material.tipoMaterial?.nome}, Cliente: ${material.cliente?.nome || 'Global'}`
        },
        { status: 409 } // Conflict
      )
    }

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