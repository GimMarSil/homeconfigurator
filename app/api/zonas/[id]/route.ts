import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/zonas/[id] - Buscar zona específica
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

    const zona = await prisma.zonaEspecifica.findUnique({
      where: { id },
      include: {
        zonaTipo: {
          select: {
            id: true,
            nome: true,
            categoria: true,
            descricao: true,
          },
        },
        edificio: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        materiaisSelecionados: {
          include: {
            material: {
              include: {
                tipoMaterial: {
                  select: {
                    nome: true,
                    categoria: true,
                    unidadeMedida: true,
                  },
                },
              },
            },
          },
          orderBy: {
            criadoEm: 'desc',
          },
        },
      },
    })

    if (!zona) {
      return NextResponse.json(
        { error: 'Zona não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(zona)
  } catch (error) {
    console.error('Erro ao buscar zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/zonas/[id] - Atualizar zona
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
    const { nome, area, estado, zonaTipoId } = body

    // Validações básicas
    if (!nome || !area || !estado) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, area, estado' },
        { status: 400 }
      )
    }

    if (area <= 0) {
      return NextResponse.json(
        { error: 'Área deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Verificar se zona existe
    const zonaExistente = await prisma.zonaEspecifica.findUnique({
      where: { id },
    })

    if (!zonaExistente) {
      return NextResponse.json(
        { error: 'Zona não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se tipo de zona existe (se fornecido)
    if (zonaTipoId) {
      const zonaTipo = await prisma.zonaTipo.findUnique({
        where: { id: zonaTipoId },
      })

      if (!zonaTipo) {
        return NextResponse.json(
          { error: 'Tipo de zona não encontrado' },
          { status: 400 }
        )
      }
    }

    const zonaAtualizada = await prisma.zonaEspecifica.update({
      where: { id },
      data: {
        nome,
        area: parseFloat(area.toString()),
        estado,
        ...(zonaTipoId && { zonaTipoId }),
        atualizadoEm: new Date(),
      },
      include: {
        zonaTipo: {
          select: {
            id: true,
            nome: true,
            categoria: true,
          },
        },
        edificio: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
        materiaisSelecionados: {
          include: {
            material: {
              include: {
                tipoMaterial: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(zonaAtualizada)
  } catch (error) {
    console.error('Erro ao atualizar zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/zonas/[id] - Eliminar zona
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

    // Verificar se zona existe
    const zona = await prisma.zonaEspecifica.findUnique({
      where: { id },
      include: {
        materiaisSelecionados: {
          select: { 
            id: true,
            material: { select: { nome: true, marca: true } }
          }
        },
        ficheiros: { select: { id: true } },
        comentarios: { select: { id: true } },
        edificio: { select: { nome: true } }
      },
    })

    if (!zona) {
      return NextResponse.json(
        { error: 'Zona não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há dependências (proteção de integridade referencial)
    const problems = []
    
    if (zona.materiaisSelecionados.length > 0) {
      const exemplosMateriais = zona.materiaisSelecionados.slice(0, 3)
        .map(ms => {
          const nome = ms.material.nome
          const marca = ms.material.marca ? ` (${ms.material.marca})` : ''
          return `${nome}${marca}`
        }).join(', ')
      
      problems.push(`${zona.materiaisSelecionados.length} materiais selecionados`)
      problems.push(`Exemplos: ${exemplosMateriais}${zona.materiaisSelecionados.length > 3 ? '...' : ''}`)
    }

    if (zona.ficheiros.length > 0) {
      problems.push(`${zona.ficheiros.length} ficheiros associados`)
    }

    if (zona.comentarios.length > 0) {
      problems.push(`${zona.comentarios.length} comentários associados`)
    }

    if (problems.length > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível eliminar a zona "${zona.nome}".`,
          details: problems.join('. '),
          suggestion: 'Remova primeiro todos os materiais selecionados, ficheiros e comentários.',
          constraint: 'REFERENTIAL_INTEGRITY',
          context: `Zona no edifício: ${zona.edificio?.nome}`
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.zonaEspecifica.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Zona eliminada com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar zona:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 