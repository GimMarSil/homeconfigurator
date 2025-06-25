import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

// DELETE /api/upload/[id] - Eliminar ficheiro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id } = await params
    const fileId = parseInt(id)
    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Buscar o ficheiro
    const ficheiro = await prisma.ficheiro.findUnique({
      where: { id: fileId },
      include: {
        edificio: { select: { clienteId: true } },
        zona: { select: { edificio: { select: { clienteId: true } } } },
        material: { select: { clienteId: true } },
        comentario: { select: { clienteId: true } }
      }
    })

    if (!ficheiro) {
      return NextResponse.json({ error: 'Ficheiro não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const hasAccess = 
      user.role === 'super_admin' ||
      ficheiro.edificio?.clienteId === user.clienteId ||
      ficheiro.zona?.edificio?.clienteId === user.clienteId ||
      ficheiro.material?.clienteId === user.clienteId ||
      ficheiro.comentario?.clienteId === user.clienteId

    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Eliminar ficheiro físico
    const filePath = join(process.cwd(), 'public', ficheiro.caminho)
    if (existsSync(filePath)) {
      try {
        await unlink(filePath)
      } catch (error) {
        console.error('Erro ao eliminar ficheiro físico:', error)
        // Continua mesmo se não conseguir eliminar o ficheiro físico
      }
    }

    // Eliminar da base de dados
    await prisma.ficheiro.delete({
      where: { id: fileId }
    })

    return NextResponse.json({ message: 'Ficheiro eliminado com sucesso' })

  } catch (error) {
    console.error('Erro ao eliminar ficheiro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id } = await params
    const fileId = parseInt(id)
    if (isNaN(fileId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const ficheiro = await prisma.ficheiro.findUnique({
      where: { id: fileId },
      include: {
        edificio: { select: { id: true, nome: true, clienteId: true } },
        zona: { select: { id: true, nome: true, edificio: { select: { clienteId: true } } } },
        material: { select: { id: true, nome: true, clienteId: true } },
        comentario: { select: { id: true, clienteId: true } }
      }
    })

    if (!ficheiro) {
      return NextResponse.json({ error: 'Ficheiro não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const hasAccess = 
      user.role === 'super_admin' ||
      ficheiro.edificio?.clienteId === user.clienteId ||
      ficheiro.zona?.edificio?.clienteId === user.clienteId ||
      ficheiro.material?.clienteId === user.clienteId ||
      ficheiro.comentario?.clienteId === user.clienteId

    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json(ficheiro)

  } catch (error) {
    console.error('Erro ao buscar ficheiro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 