# Home Configurator - Guia do Administrador

## 📖 Índice
1. [Introdução](#introdução)
2. [Instalação e Configuração](#instalação-e-configuração)
3. [Gestão de Utilizadores](#gestão-de-utilizadores)
4. [Configuração da Base de Dados](#configuração-da-base-de-dados)
5. [Gestão de Ficheiros](#gestão-de-ficheiros)
6. [Segurança](#segurança)
7. [Performance e Monitorização](#performance-e-monitorização)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Troubleshooting](#troubleshooting)
10. [Manutenção](#manutenção)

---

## 👨‍💼 Introdução

Este guia destina-se aos administradores de sistema responsáveis pela instalação, configuração e manutenção da aplicação Home Configurator.

### Responsabilidades do Administrador
- **Instalação e Configuração**: Setup inicial do sistema
- **Gestão de Utilizadores**: Criação e manutenção de contas
- **Monitorização**: Acompanhamento da performance e disponibilidade
- **Segurança**: Implementação de medidas de proteção
- **Backup**: Garantia da preservação dos dados

---

## 🚀 Instalação e Configuração

### Requisitos do Sistema

#### Hardware Mínimo
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4GB (recomendado 8GB)
- **Armazenamento**: 50GB SSD
- **Rede**: 100 Mbps

#### Software Necessário
- **Docker**: v24.0+
- **Docker Compose**: v2.20+
- **MariaDB**: v10.5+
- **Node.js**: v20.0+ (para desenvolvimento)

### Instalação via Docker

#### 1. Preparação do Ambiente
```bash
# Criar diretório do projeto
mkdir /opt/home-configurator
cd /opt/home-configurator

# Clonar o repositório
git clone https://github.com/exemplo/home-configurator.git .

# Criar diretórios necessários
mkdir -p uploads backups logs
```

#### 2. Configuração das Variáveis de Ambiente
```env
# .env
DATABASE_URL="mysql://homeconfig:password123@db:3306/homeconfigurator"
NEXTAUTH_URL=https://homeconfigurator.exemplo.pt
NEXTAUTH_SECRET=sua-chave-secreta-muito-segura-aqui
MAX_FILE_SIZE=10485760
```

#### 3. Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/public/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=homeconfigurator
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

---

## 👥 Gestão de Utilizadores

### Tipos de Utilizador

| Role | Permissões |
|------|------------|
| **SUPER_ADMIN** | Acesso total ao sistema |
| **ADMIN** | Gestão de clientes e edifícios |
| **GESTOR** | Gestão de projetos atribuídos |
| **VISUALIZADOR** | Apenas leitura |

### Criação de Utilizador Administrativo

```sql
INSERT INTO utilizadores (nome, email, password, role, status, clienteId) 
VALUES (
    'Administrador Sistema',
    'admin@exemplo.pt',
    '$2b$12$hash_da_password_bcrypt',
    'SUPER_ADMIN',
    'ATIVO',
    1
);
```

---

## 🗄️ Configuração da Base de Dados

### Migrações

```bash
# Aplicar migrações
docker-compose exec app npx prisma migrate deploy

# Ver estado
docker-compose exec app npx prisma migrate status
```

### Otimização

```sql
-- Índices importantes
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_edificios_cliente ON edificios(clienteId);
CREATE INDEX idx_zonas_edificio ON zonas_especificas(edificioId);
```

---

## 📁 Gestão de Ficheiros

### Estrutura de Diretórios
```
uploads/
├── plantas/          # Plantas dos edifícios
├── materiais/        # Imagens de materiais
├── fichas-tecnicas/  # PDFs técnicos
└── temp/            # Ficheiros temporários
```

### Configuração de Permissions
```bash
chown -R 1000:1000 uploads
chmod -R 755 uploads
```

---

## 🔒 Segurança

### HTTPS e Certificados

```bash
# Let's Encrypt
sudo certbot --nginx -d homeconfigurator.exemplo.pt

# Renovação automática
0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 📊 Performance e Monitorização

### Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

### Script de Monitorização

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -ne 200 ]; then
    echo "ALERT: Health check failed" | mail -s "Alert" admin@exemplo.pt
fi
```

---

## 💾 Backup e Recuperação

### Backup Automático

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db mysqldump -u root -p$MYSQL_ROOT_PASSWORD homeconfigurator > backup_$DATE.sql
gzip backup_$DATE.sql
```

### Agendamento

```bash
# Backup diário às 03:00
0 3 * * * /opt/home-configurator/scripts/backup.sh
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Aplicação Não Inicia
```bash
docker-compose logs app
docker-compose exec app env | grep DATABASE_URL
```

#### Conexão BD
```bash
docker-compose ps db
docker-compose logs db
```

#### Upload Falha
```bash
ls -la uploads/
df -h
```

---

## 🛠️ Manutenção

### Atualizações

```bash
# Backup antes
./scripts/backup.sh

# Atualizar
git pull origin main
docker-compose build app
docker-compose up -d

# Migrações
docker-compose exec app npx prisma migrate deploy
```

### Limpeza

```bash
# Docker
docker image prune -f
docker volume prune -f

# BD
OPTIMIZE TABLE clientes, edificios, materiais;
```

---

*Para documentação completa, consulte: https://docs.homeconfigurator.pt* 