"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Home, Users, Shield, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [utilizadores, setUtilizadores] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])

  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }

    // Carregar utilizadores e clientes para mostrar credenciais disponíveis
    const savedUtilizadores = localStorage.getItem("utilizadores")
    const savedClientes = localStorage.getItem("clientes")

    if (savedUtilizadores) {
      setUtilizadores(JSON.parse(savedUtilizadores))
    }
    if (savedClientes) {
      setClientes(JSON.parse(savedClientes))
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Email ou palavra-passe incorretos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const utilizadoresAtivos = utilizadores.filter((u) => u.status === "Ativo")
  const clientesAtivos = clientes.filter((c) => c.status === "Ativo")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Login */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold">Home Configurator</CardTitle>
              <CardDescription className="mt-2">Inicie sessão na sua conta</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar-me
                  </Label>
                </div>
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Esqueceu-se da palavra-passe?
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "A iniciar sessão..." : "Iniciar Sessão"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Credenciais Disponíveis */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Credenciais de Teste</h3>
            <p className="text-gray-600 text-sm mb-6">
              Clique em qualquer utilizador para preencher automaticamente as credenciais
            </p>
          </div>

          {/* Super Admin */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Super Administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleQuickLogin("admin@homeconfigurator.pt", "admin123")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Super Admin</div>
                    <div className="text-sm text-gray-600">admin@homeconfigurator.pt</div>
                  </div>
                  <Badge variant="destructive">Super Admin</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Utilizadores por Cliente */}
          {clientesAtivos.map((cliente) => {
            const utilizadoresCliente = utilizadoresAtivos.filter((u) => u.clienteId === cliente.id)

            if (utilizadoresCliente.length === 0) return null

            return (
              <Card key={cliente.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    {cliente.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {utilizadoresCliente.map((utilizador) => (
                      <div
                        key={utilizador.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleQuickLogin(utilizador.email, utilizador.password)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{utilizador.nome}</div>
                            <div className="text-sm text-gray-600">{utilizador.email}</div>
                            <div className="text-xs text-gray-500">Palavra-passe: {utilizador.password}</div>
                          </div>
                          <Badge
                            variant={
                              utilizador.role === "admin"
                                ? "default"
                                : utilizador.role === "gestor"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {utilizador.role === "admin"
                              ? "Admin"
                              : utilizador.role === "gestor"
                                ? "Gestor"
                                : "Visualizador"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {utilizadoresAtivos.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum utilizador ativo encontrado</p>
                <p className="text-sm">Adicione utilizadores aos clientes primeiro</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
