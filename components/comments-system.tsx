'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Reply, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react'
import { useApiData } from '@/hooks/use-api-data'
import { useAuth } from '@/contexts/auth-context'

interface Comentario {
  id: number
  conteudo: string
  tipo: 'GERAL' | 'DUVIDA' | 'SUGESTAO' | 'PROBLEMA' | 'APROVACAO' | 'REJEICAO' | 'INFORMACAO'
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE'
  resolvido: boolean
  privado: boolean
  criadoEm: string
  utilizador: {
    id: number
    nome: string
    email: string
    avatar?: string
    role: string
  }
  edificio?: {
    id: number
    nome: string
  }
  zona?: {
    id: number
    nome: string
  }
  material?: {
    id: number
    nome: string
  }
  respostas: Comentario[]
  ficheiros: Array<{
    id: number
    nomeOriginal: string
    caminho: string
  }>
}

interface CommentsSystemProps {
  edificioId?: number
  zonaId?: number
  materialId?: number
  showPrivate?: boolean
}

export function CommentsSystem({ 
  edificioId, 
  zonaId, 
  materialId, 
  showPrivate = false 
}: CommentsSystemProps) {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'GERAL'>('GERAL')
  const [priority, setPriority] = useState<'NORMAL'>('NORMAL')
  const [isPrivate, setIsPrivate] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  // Buscar comentários
  const { data: comentarios, loading, refetch } = useApiData<Comentario[]>('/api/comentarios', {
    edificioId: edificioId?.toString(),
    zonaId: zonaId?.toString(),
    materialId: materialId?.toString(),
    apenasNaoResolvidos: !showResolved
  })

  // Filtrar comentários principais (não respostas)
  const mainComments = comentarios?.filter(c => !c.respostas.length || c.respostas.length === 0) || []

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conteudo: newComment.trim(),
          tipo: commentType,
          prioridade: priority,
          privado: isPrivate && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'),
          edificioId,
          zonaId,
          materialId
        })
      })

      if (response.ok) {
        setNewComment('')
        setCommentType('GERAL')
        setPriority('NORMAL')
        setIsPrivate(false)
        refetch()
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
    }
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return

    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conteudo: replyContent.trim(),
          tipo: 'GERAL',
          prioridade: 'NORMAL',
          comentarioPaiId: parentId
        })
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        refetch()
      }
    } catch (error) {
      console.error('Erro ao criar resposta:', error)
    }
  }

  const handleToggleResolved = async (commentId: number, resolved: boolean) => {
    try {
      const response = await fetch(`/api/comentarios/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolvido: resolved })
      })

      if (response.ok) {
        refetch()
      }
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'DUVIDA': return <AlertCircle className="h-4 w-4" />
      case 'PROBLEMA': return <Flag className="h-4 w-4" />
      case 'APROVACAO': return <CheckCircle className="h-4 w-4" />
      case 'REJEICAO': return <AlertCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'URGENTE': return 'bg-red-100 text-red-800'
      case 'ALTA': return 'bg-orange-100 text-orange-800'
      case 'NORMAL': return 'bg-blue-100 text-blue-800'
      case 'BAIXA': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderComment = (comment: Comentario, isReply = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-muted' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.utilizador.avatar} />
            <AvatarFallback>
              {comment.utilizador.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.utilizador.nome}</span>
              <Badge variant="outline" className="text-xs">
                {comment.utilizador.role}
              </Badge>
              {comment.privado && (
                <Badge variant="secondary" className="text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Privado
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.criadoEm)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {getTypeIcon(comment.tipo)}
                <span className="text-xs text-muted-foreground capitalize">
                  {comment.tipo.toLowerCase()}
                </span>
              </div>
              <Badge className={`text-xs ${getPriorityColor(comment.prioridade)}`}>
                {comment.prioridade}
              </Badge>
              {comment.resolvido && (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolvido
                </Badge>
              )}
            </div>

            <p className="text-sm">{comment.conteudo}</p>

            {comment.ficheiros.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {comment.ficheiros.map(file => (
                  <Button key={file.id} variant="outline" size="sm" asChild>
                    <a href={file.caminho} target="_blank" rel="noopener noreferrer">
                      {file.nomeOriginal}
                    </a>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Responder
                </Button>
              )}
              
              {!comment.resolvido && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleResolved(comment.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar como resolvido
                </Button>
              )}

              {comment.resolvido && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleResolved(comment.id, false)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Reabrir
                </Button>
              )}
            </div>

            {/* Formulário de resposta */}
            {replyingTo === comment.id && (
              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Escreva uma resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Responder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyContent('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Respostas */}
            {comment.respostas && comment.respostas.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.respostas.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários e Discussão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showResolved"
                checked={showResolved}
                onCheckedChange={(checked) => setShowResolved(checked as boolean)}
              />
              <label htmlFor="showResolved" className="text-sm">
                Mostrar resolvidos
              </label>
            </div>
          </div>

          {/* Novo comentário */}
          <div className="space-y-3">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            
            <div className="flex items-center gap-4">
              <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GERAL">Geral</SelectItem>
                  <SelectItem value="DUVIDA">Dúvida</SelectItem>
                  <SelectItem value="SUGESTAO">Sugestão</SelectItem>
                  <SelectItem value="PROBLEMA">Problema</SelectItem>
                  <SelectItem value="INFORMACAO">Informação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>

              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                  />
                  <label htmlFor="isPrivate" className="text-sm">
                    Privado
                  </label>
                </div>
              )}

              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="ml-auto"
              >
                Comentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">A carregar comentários...</p>
          </div>
        ) : mainComments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum comentário ainda</p>
              <p className="text-sm text-muted-foreground">Seja o primeiro a comentar!</p>
            </CardContent>
          </Card>
        ) : (
          mainComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
} 