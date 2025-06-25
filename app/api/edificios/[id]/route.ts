import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// GET /api/edificios/[id] - Buscar edifício específico
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

    const edificio = await prisma.edificio.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        zonasEspecificas: {
          include: {
            zonaTipo: true,
            materiaisSelecionados: {
              include: {
                material: {
                  select: {
                    id: true,
                    nome: true,
                    marca: true,
                    precoUnitario: true,
                    imagem: true,
                  },
                },
              },
            },
          },
          orderBy: {
            nome: 'asc',
          },
        },
      },
    })

    if (!edificio) {
      return NextResponse.json(
        { error: 'Edifício não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(edificio)
  } catch (error) {
    console.error('Erro ao buscar edifício:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/edificios/[id] - Atualizar edifício
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
      morada,
      tipologia,
      nPisos,
      areaBruta,
      anoConstrucao,
      plantaImagem,
      estado,
      clienteId,
    } = body

    // Verificar se edifício existe
    const edificioExistente = await prisma.edificio.findUnique({
      where: { id },
    })

    if (!edificioExistente) {
      return NextResponse.json(
        { error: 'Edifício não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se cliente existe (se fornecido)
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: parseInt(clienteId) },
      })

      if (!cliente) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 400 }
        )
      }
    }

    const edificioAtualizado = await prisma.edificio.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(morada && { morada }),
        ...(tipologia !== undefined && { tipologia: tipologia || null }),
        ...(nPisos !== undefined && { nPisos: parseInt(nPisos) || 1 }),
        ...(areaBruta !== undefined && { areaBruta: parseFloat(areaBruta) || null }),
        ...(anoConstrucao !== undefined && { anoConstrucao: parseInt(anoConstrucao) || null }),
        ...(plantaImagem !== undefined && { plantaImagem: plantaImagem || null }),
        ...(estado && { estado }),
        ...(clienteId && { clienteId: parseInt(clienteId) }),
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        zonasEspecificas: {
          include: {
            zonaTipo: true,
          },
        },
      },
    })

    return NextResponse.json(edificioAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar edifício:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/edificios/[id] - Eliminar edifício
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

    // Verificar se edifício existe
    const edificio = await prisma.edificio.findUnique({
      where: { id },
      include: {
        zonasEspecificas: {
          select: { 
            id: true, 
            nome: true,
            materiaisSelecionados: { select: { id: true } }
          }
        },
        ficheiros: { select: { id: true } },
        comentarios: { select: { id: true } }
      },
    })

    if (!edificio) {
      return NextResponse.json(
        { error: 'Edifício não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se edifício tem dependências (proteção de integridade referencial)
    const problems = []
    
    if (edificio.zonasEspecificas.length > 0) {
      const zonasComMateriais = edificio.zonasEspecificas.filter(z => z.materiaisSelecionados.length > 0)
      const exemplosZonas = edificio.zonasEspecificas.slice(0, 3).map(z => z.nome).join(', ')
      
      problems.push(`${edificio.zonasEspecificas.length} zonas associadas (${zonasComMateriais.length} com materiais selecionados)`)
      problems.push(`Exemplos de zonas: ${exemplosZonas}${edificio.zonasEspecificas.length > 3 ? '...' : ''}`)
    }

    if (edificio.ficheiros.length > 0) {
      problems.push(`${edificio.ficheiros.length} ficheiros associados`)
    }

    if (edificio.comentarios.length > 0) {
      problems.push(`${edificio.comentarios.length} comentários associados`)
    }

    if (problems.length > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível eliminar este edifício.`,
          details: problems.join('. '),
          suggestion: 'Remova primeiro todas as zonas, ficheiros e comentários associados.',
          constraint: 'REFERENTIAL_INTEGRITY'
        },
        { status: 409 } // Conflict
      )
    }

    await prisma.edificio.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Edifício eliminado com sucesso' })
  } catch (error) {
    console.error('Erro ao eliminar edifício:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 