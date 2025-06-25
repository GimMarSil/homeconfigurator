import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Verificar conexão com a base de dados
    await prisma.$queryRaw`SELECT 1`
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    const response = {
      status: 'error',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message,
      uptime: process.uptime(),
    }

    return NextResponse.json(response, { status: 503 })
  }
} 