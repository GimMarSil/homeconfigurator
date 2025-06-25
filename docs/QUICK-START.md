# Home Configurator - Guia de Início Rápido

## 🚀 Configuração Rápida (5 minutos)

Este guia permite ter o Home Configurator funcionando localmente em menos de 5 minutos para testes e desenvolvimento.

---

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** v20.0+ ([Download](https://nodejs.org/))
- **Docker** ([Download](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/))

### Verificar Instalação
```bash
node --version    # v20.0.0+
docker --version  # 24.0.0+
git --version     # 2.0.0+
```

---

## ⚡ Setup em 3 Passos

### 1. Clonar e Configurar
```bash
# Clonar repositório
git clone https://github.com/exemplo/home-configurator.git
cd home-configurator

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
```

### 2. Iniciar Base de Dados
```bash
# Iniciar MariaDB via Docker
docker run -d \
  --name homeconfig-db \
  -e MYSQL_ROOT_PASSWORD=rootpass123 \
  -e MYSQL_DATABASE=homeconfigurator \
  -e MYSQL_USER=homeconfig \
  -e MYSQL_PASSWORD=userpass123 \
  -p 3306:3306 \
  mariadb:10.11
```

### 3. Configurar e Executar
```bash
# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# Iniciar aplicação
npm run dev
```

**🎉 Pronto!** Aceda a: http://localhost:3000

---

## 🔑 Login Inicial

### Utilizador de Teste
- **Email**: `admin@teste.pt`
- **Password**: `admin123`

### Criar Utilizador Admin
```bash
# Via script (opcional)
npm run seed:admin
```

---

## 📊 Dados de Teste

### Carregar Dados de Exemplo
```bash
# Executar seed completo
npm run seed

# Ou apenas dados básicos
npm run seed:basic
```

### Dados Incluídos
- **3 Clientes** de exemplo
- **5 Edifícios** com plantas
- **15 Zonas** configuradas
- **20 Materiais** com imagens
- **10 Materiais selecionados** por zona

---

## 🧪 Testar Funcionalidades

### 1. Gestão de Clientes
```
1. Aceder a /dashboard/clientes
2. Clicar "Adicionar Cliente"
3. Preencher: Nome, Email, Telefone
4. Guardar e verificar lista
```

### 2. Gestão de Edifícios
```
1. Aceder a /dashboard/edificios
2. Clicar "Adicionar Edifício"
3. Selecionar cliente existente
4. Upload de planta (opcional)
5. Guardar e visualizar
```

### 3. Sistema de Comparação
```
1. Aceder a /dashboard/zonas
2. Clicar numa zona existente
3. Clicar "Gerir Materiais"
4. Selecionar 2+ materiais
5. Clicar "Comparar (X)"
6. Visualizar modal de comparação
```

---

## 🐛 Resolução Rápida

### Aplicação Não Inicia
```bash
# Verificar porta ocupada
lsof -i :3000

# Matar processo se necessário
kill -9 $(lsof -t -i:3000)

# Verificar logs
npm run dev -- --turbo
```

### Erro de Base de Dados
```bash
# Verificar se Docker está a correr
docker ps

# Reiniciar container
docker restart homeconfig-db

# Verificar conexão
docker exec -it homeconfig-db mysql -u homeconfig -p homeconfigurator
```

### Erro de Migrações
```bash
# Reset da base de dados
npx prisma migrate reset

# Executar migrações novamente
npx prisma migrate dev

# Regenerar cliente
npx prisma generate
```

---

## ⚙️ Configuração Avançada

### Variáveis de Ambiente (.env)
```env
# Base de Dados
DATABASE_URL="mysql://homeconfig:userpass123@localhost:3306/homeconfigurator"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="chave-secreta-desenvolvimento-123"

# Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=public/uploads

# Desenvolvimento
NODE_ENV=development
DEBUG=true
```

### Scripts Úteis
```bash
# Desenvolver com hot reload
npm run dev

# Compilar para produção
npm run build

# Executar em produção
npm start

# Executar testes
npm test

# Linting e formatação
npm run lint
npm run format

# Base de dados
npm run db:studio    # Prisma Studio
npm run db:seed      # Carregar dados
npm run db:reset     # Reset completo
```

---

## 🔧 Ferramentas de Desenvolvimento

### Prisma Studio
```bash
# Abrir interface visual da BD
npx prisma studio
# Aceder: http://localhost:5555
```

### Logs de Desenvolvimento
```bash
# Ver logs em tempo real
tail -f logs/development.log

# Debug da aplicação
DEBUG=* npm run dev
```

### Hot Reload
O Next.js inclui hot reload automático. Alterações em:
- **Páginas**: Reload automático
- **Componentes**: Reload automático
- **API Routes**: Reload automático
- **Prisma Schema**: Requer `npx prisma generate`

---

## 📱 Testar em Dispositivos Móveis

### Acesso Local
```bash
# Obter IP local
ipconfig getifaddr en0  # macOS
hostname -I | awk '{print $1}'  # Linux

# Iniciar com bind a todas as interfaces
npm run dev -- -H 0.0.0.0
```

### Aceder de Outros Dispositivos
```
http://192.168.1.100:3000  # Substituir pelo IP local
```

---

## 🚀 Deploy Rápido (Desenvolvimento)

### Docker Compose (Recomendado)
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db

  db:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass123
      - MYSQL_DATABASE=homeconfigurator
    ports:
      - "3306:3306"
```

```bash
# Executar com Docker Compose
docker-compose -f docker-compose.dev.yml up
```

---

## 🎯 Próximos Passos

### Para Desenvolvimento
1. **Configurar IDE**: VS Code com extensões recomendadas
2. **Configurar Git**: Hooks de pre-commit
3. **Ler Documentação**: [API-DOCUMENTATION.md](API-DOCUMENTATION.md)

### Para Produção
1. **Ler Deployment**: [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
2. **Configurar Monitorização**: Logs e métricas
3. **Configurar Backup**: Base de dados e ficheiros

### Para Utilizadores
1. **Ler Manual**: [USER-GUIDE.md](USER-GUIDE.md)
2. **Configurar Dados**: Clientes e edifícios reais
3. **Treinar Equipa**: Workshop de utilização

---

## 📞 Suporte Rápido

### Problemas Comuns
- **Porta 3000 ocupada**: `kill -9 $(lsof -t -i:3000)`
- **BD não conecta**: Verificar Docker e credenciais
- **Migrações falham**: `npx prisma migrate reset`
- **Upload não funciona**: Verificar permissions da pasta uploads

### Contactos
- **Documentação**: [README.md](README.md)
- **Issues**: GitHub Issues
- **Email**: dev@homeconfigurator.pt

---

*⏰ Tempo estimado de setup: 3-5 minutos*
*🎯 Para uso em produção, consulte o [Guia de Deployment](DEPLOYMENT-GUIDE.md)* 