import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: number
  className?: string
  text?: string
}

export function Loading({ size = 24, className = "", text = "A carregar..." }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size={32} text="A carregar aplicação..." />
    </div>
  )
}

export function FullScreenLoading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading size={32} text="A carregar..." />
    </div>
  )
} 