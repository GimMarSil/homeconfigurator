#!/usr/bin/env node

/**
 * Script de Melhorias Automáticas para o Home Configurator
 * 
 * Este script aplica automaticamente:
 * 1. Proteções de integridade referencial em APIs DELETE
 * 2. Correções de authMiddleware → requireAuth
 * 3. Melhorias de validação e mensagens de erro
 * 4. Verificações de dependências antes de eliminações
 */

const fs = require('fs')
const path = require('path')

// Configuração
const CONFIG = {
  apiDir: 'app/api',
  projectRoot: process.cwd(),
  backupDir: 'backups/auto-improvements'
}

// Templates de melhorias
const TEMPLATES = {
  // Template para proteção de DELETE com integridade referencial
  deleteProtection: `
// Verificar dependências antes da eliminação
const dependencias = await prisma.\${model}.count({
  where: { \${foreignKey}: \${id} }
})

if (dependencias > 0) {
  // Buscar exemplos específicos para mostrar ao utilizador
  const exemplos = await prisma.\${model}.findMany({
    where: { \${foreignKey}: \${id} },
    take: 3,
    select: { id: true, nome: true }
  })

  return NextResponse.json({
    error: 'Não é possível eliminar porque existem registos dependentes',
    details: {
      modelo: '\${modelName}',
      total: dependencias,
      exemplos: exemplos.map(ex => \`\${ex.nome} (ID: \${ex.id})\`),
      sugestao: 'Remova primeiro os registos associados ou altere as suas referências'
    }
  }, { status: 409 })
}`,

  // Template para substituição de authMiddleware
  authFix: `
// Corrigido: authMiddleware → requireAuth
const user = await requireAuth(request)`,

  // Template para import correto
  requireAuthImport: `import { requireAuth } from '@/lib/auth-middleware'`
}

// Mapeamento de modelos e suas dependências
const MODEL_DEPENDENCIES = {
  'tipos-material': [
    { model: 'material', foreignKey: 'tipoMaterialId', modelName: 'Materiais' }
  ],
  'zonas-tipo': [
    { model: 'zonaEspecifica', foreignKey: 'zonaTipoId', modelName: 'Zonas Específicas' }
  ],
  'clientes': [
    { model: 'edificio', foreignKey: 'clienteId', modelName: 'Edifícios' },
    { model: 'utilizador', foreignKey: 'clienteId', modelName: 'Utilizadores' },
    { model: 'material', foreignKey: 'clienteId', modelName: 'Materiais' }
  ],
  'edificios': [
    { model: 'zona', foreignKey: 'edificioId', modelName: 'Zonas' },
    { model: 'ficheiro', foreignKey: 'edificioId', modelName: 'Ficheiros' }
  ],
  'zonas': [
    { model: 'materialSelecionado', foreignKey: 'zonaId', modelName: 'Materiais Selecionados' },
    { model: 'comentario', foreignKey: 'zonaId', modelName: 'Comentários' },
    { model: 'ficheiro', foreignKey: 'zonaId', modelName: 'Ficheiros' }
  ],
  'materiais': [
    { model: 'materialSelecionado', foreignKey: 'materialId', modelName: 'Seleções de Material' },
    { model: 'ficheiro', foreignKey: 'materialId', modelName: 'Ficheiros' },
    { model: 'notificacao', foreignKey: 'materialId', modelName: 'Notificações' }
  ],
  'utilizadores': [
    { model: 'notificacao', foreignKey: 'remetenteId', modelName: 'Notificações como Remetente' },
    { model: 'notificacao', foreignKey: 'destinatarioId', modelName: 'Notificações como Destinatário' },
    { model: 'comentario', foreignKey: 'autorId', modelName: 'Comentários' }
  ]
}

class AutoImprovements {
  constructor() {
    this.improvements = []
    this.errors = []
  }

  log(message) {
    console.log(`✅ ${message}`)
  }

  error(message) {
    console.error(`❌ ${message}`)
    this.errors.push(message)
  }

  async createBackup() {
    const backupPath = path.join(CONFIG.projectRoot, CONFIG.backupDir)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fullBackupPath = path.join(backupPath, timestamp)

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true })
    }

    // Backup das APIs
    const apiPath = path.join(CONFIG.projectRoot, CONFIG.apiDir)
    this.copyRecursive(apiPath, path.join(fullBackupPath, CONFIG.apiDir))
    
    this.log(`Backup criado em: ${fullBackupPath}`)
  }

  copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }

    const items = fs.readdirSync(src)
    items.forEach(item => {
      const srcPath = path.join(src, item)
      const destPath = path.join(dest, item)
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyRecursive(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
      }
    })
  }

  async findApiFiles() {
    const apiPath = path.join(CONFIG.projectRoot, CONFIG.apiDir)
    const files = []

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir)
      items.forEach(item => {
        const fullPath = path.join(dir, item)
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath)
        } else if (item === 'route.ts') {
          files.push(fullPath)
        }
      })
    }

    scanDirectory(apiPath)
    return files
  }

  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(CONFIG.projectRoot, filePath)
    
    const analysis = {
      file: relativePath,
      hasAuthMiddleware: content.includes('authMiddleware'),
      hasDeleteFunction: content.includes('export async function DELETE'),
      hasRequireAuth: content.includes('requireAuth'),
      hasProtections: content.includes('Não é possível eliminar porque existem registos dependentes'),
      needsImprovements: false
    }

    // Determinar se precisa de melhorias
    if (analysis.hasAuthMiddleware || 
        (analysis.hasDeleteFunction && !analysis.hasProtections)) {
      analysis.needsImprovements = true
    }

    return analysis
  }

  async applyAuthFix(filePath, content) {
    let newContent = content

    // Substituir import
    if (content.includes("import { authMiddleware }")) {
      newContent = newContent.replace(
        /import { authMiddleware } from '@\/lib\/auth-middleware'/g,
        TEMPLATES.requireAuthImport.trim()
      )
    }

    // Substituir uso do authMiddleware
    const authPattern = /const authResult = await authMiddleware\(request\)\s+if \(!authResult\.success \|\| !authResult\.user\) {\s+return NextResponse\.json\(\{ error: 'Não autorizado' \}, \{ status: 401 \}\)\s+}/g
    newContent = newContent.replace(authPattern, TEMPLATES.authFix.trim())

    // Corrigir referências a authResult.user
    newContent = newContent.replace(/authResult\.user/g, 'user')

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      this.log(`Correção de autenticação aplicada: ${path.relative(CONFIG.projectRoot, filePath)}`)
      return true
    }

    return false
  }

  async applyDeleteProtections(filePath, content) {
    // Identificar o modelo baseado no caminho
    const pathParts = filePath.split(path.sep)
    const apiIndex = pathParts.indexOf('api')
    const modelPath = pathParts[apiIndex + 1]
    
    if (!MODEL_DEPENDENCIES[modelPath]) {
      return false
    }

    // Verificar se já tem proteções
    if (content.includes('Não é possível eliminar porque existem registos dependentes')) {
      return false
    }

    // Encontrar a função DELETE
    const deleteMatch = content.match(/export async function DELETE[^}]+}/s)
    if (!deleteMatch) {
      return false
    }

    const dependencies = MODEL_DEPENDENCIES[modelPath]
    let protectionCode = '\n    // Verificações de integridade referencial\n'
    
    dependencies.forEach(dep => {
      protectionCode += `
    const ${dep.model}Count = await prisma.${dep.model}.count({
      where: { ${dep.foreignKey}: id }
    })

    if (${dep.model}Count > 0) {
      const exemplos = await prisma.${dep.model}.findMany({
        where: { ${dep.foreignKey}: id },
        take: 3,
        select: { id: true, nome: true }
      })

      return NextResponse.json({
        error: 'Não é possível eliminar porque existem registos dependentes',
        details: {
          modelo: '${dep.modelName}',
          total: ${dep.model}Count,
          exemplos: exemplos.map(ex => \`\${ex.nome || 'ID: ' + ex.id}\`),
          sugestao: 'Remova primeiro os registos de ${dep.modelName.toLowerCase()} associados'
        }
      }, { status: 409 })
    }
`
    })

    // Inserir as proteções antes da eliminação
    const newContent = content.replace(
      /(export async function DELETE[^{]+{[^}]*?)(\s*const\s+\w+\s*=\s*await\s+prisma\.\w+\.delete)/s,
      `$1${protectionCode}\n$2`
    )

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent)
      this.log(`Proteções DELETE aplicadas: ${path.relative(CONFIG.projectRoot, filePath)}`)
      return true
    }

    return false
  }

  async applyImprovements() {
    this.log('🚀 Iniciando melhorias automáticas...')
    
    // Criar backup
    await this.createBackup()

    // Encontrar todas as APIs
    const apiFiles = await this.findApiFiles()
    this.log(`Encontrados ${apiFiles.length} ficheiros de API`)

    let totalImprovements = 0

    for (const file of apiFiles) {
      try {
        const analysis = await this.analyzeFile(file)
        
        if (!analysis.needsImprovements) {
          continue
        }

        this.log(`\n📝 Processando: ${analysis.file}`)
        
        const content = fs.readFileSync(file, 'utf8')
        let improved = false

        // Aplicar correções de autenticação
        if (analysis.hasAuthMiddleware) {
          const authFixed = await this.applyAuthFix(file, fs.readFileSync(file, 'utf8'))
          if (authFixed) improved = true
        }

        // Aplicar proteções DELETE
        if (analysis.hasDeleteFunction && !analysis.hasProtections) {
          const protectionsAdded = await this.applyDeleteProtections(file, fs.readFileSync(file, 'utf8'))
          if (protectionsAdded) improved = true
        }

        if (improved) {
          totalImprovements++
          this.improvements.push(analysis.file)
        }

      } catch (error) {
        this.error(`Erro ao processar ${file}: ${error.message}`)
      }
    }

    // Relatório final
    this.generateReport(totalImprovements)
  }

  generateReport(totalImprovements) {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RELATÓRIO DE MELHORIAS AUTOMÁTICAS')
    console.log('='.repeat(60))
    
    this.log(`Total de ficheiros melhorados: ${totalImprovements}`)
    
    if (this.improvements.length > 0) {
      console.log('\n✅ Ficheiros melhorados:')
      this.improvements.forEach(file => console.log(`   • ${file}`))
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Erros encontrados:')
      this.errors.forEach(error => console.log(`   • ${error}`))
    }

    console.log('\n🎯 Melhorias aplicadas:')
    console.log('   • Correções de autenticação (authMiddleware → requireAuth)')
    console.log('   • Proteções de integridade referencial automáticas')
    console.log('   • Mensagens de erro detalhadas com exemplos')
    console.log('   • Verificações de dependências antes de eliminações')
    
    console.log('\n' + '='.repeat(60))
    this.log('Melhorias automáticas concluídas!')
  }
}

// Executar melhorias se chamado diretamente
if (require.main === module) {
  const improver = new AutoImprovements()
  improver.applyImprovements().catch(console.error)
}

module.exports = AutoImprovements 