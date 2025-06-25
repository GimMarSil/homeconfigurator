"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, MapPin, Package, LogOut, Menu, Home, Shield, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users, superAdminOnly: true },
  { name: "Edifícios", href: "/dashboard/edificios", icon: Building2 },
  { name: "Zonas", href: "/dashboard/zonas", icon: MapPin },
  { name: "Materiais", href: "/dashboard/materiais", icon: Package },
  { name: "Aprovações", href: "/dashboard/aprovacoes", icon: Shield, adminOnly: true },
  { name: "Configurações", href: "/dashboard/configuracoes", icon: Settings, adminOnly: true },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const filteredNavigation = navigation.filter((item) => {
    if (item.superAdminOnly && user?.role !== "super_admin") return false
    if (item.adminOnly && !['super_admin', 'admin'].includes(user?.role || '')) return false
    return true
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Home className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-semibold">Home Configurator</span>
                {user?.clienteNome && <div className="text-xs text-gray-500 truncate">{user.clienteNome}</div>}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {user?.role === "super_admin" ? (
                    <Shield className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Users className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={user?.role === "super_admin" ? "destructive" : "secondary"} className="text-xs">
                      {user?.role === "super_admin"
                        ? "Super Admin"
                        : user?.role === "admin"
                          ? "Admin"
                          : user?.role === "gestor"
                            ? "Gestor"
                            : "Visualizador"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden mr-4"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Olá, {user?.name || "Utilizador"}</h1>
                  {user?.clienteNome && user?.role !== "super_admin" && (
                    <p className="text-sm text-gray-600">{user.clienteNome}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </ProtectedRoute>
  )
}
