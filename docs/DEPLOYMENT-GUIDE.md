# Home Configurator - Guia de Deployment

## 📖 Índice
1. [Visão Geral](#visão-geral)
2. [Deployment em NAS Synology](#deployment-em-nas-synology)
3. [Deployment em VM Linux](#deployment-em-vm-linux)
4. [Deployment em Cloud](#deployment-em-cloud)
5. [Configurações de Produção](#configurações-de-produção)
6. [SSL e Domínio](#ssl-e-domínio)
7. [Monitorização](#monitorização)

---

## 🌐 Visão Geral

O Home Configurator pode ser implantado em diferentes ambientes:
- **NAS Synology**: Para uso interno e pequenas equipas
- **VM Linux**: Para maior controlo e flexibilidade
- **Cloud**: Para escalabilidade e disponibilidade máxima

### Arquitetura de Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (MariaDB)     │
│   Port: 3000    │    │   Port: 3000    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Proxy                                 │
│                 Ports: 80, 443                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏠 Deployment em NAS Synology

### Pré-requisitos

#### Software Necessário
- **DSM 7.0+**
- **Container Manager** (Docker)
- **Git Server** (opcional)
- **Web Station** (para proxy)

#### Hardware Recomendado
- **CPU**: Intel/AMD de 4 núcleos
- **RAM**: 8GB mínimo
- **Armazenamento**: 100GB disponível

### Preparação do Ambiente

#### 1. Ativar SSH
```bash
# Via DSM: Painel de Controlo > Terminal & SNMP > Terminal
# Marcar "Ativar serviço SSH"
```

#### 2. Criar Estrutura de Pastas
```bash
# Via File Station ou SSH
mkdir -p /volume1/docker/home-configurator/{uploads,backups,logs}
cd /volume1/docker/home-configurator
```

#### 3. Preparar Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: ["npm", "start"]
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://homeconfig:${DB_PASSWORD}@db:3306/homeconfigurator
      - NEXTAUTH_URL=https://${DOMAIN}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    volumes:
      - ./app:/app
      - ./uploads:/app/public/uploads
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=homeconfigurator
      - MYSQL_USER=homeconfig
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./backups:/backups
    restart: unless-stopped

volumes:
  db_data:
```

#### 4. Configurar Variáveis
```bash
# .env
DOMAIN=homeconfigurator.minha-nas.synology.me
DB_PASSWORD=password-seguro-123
DB_ROOT_PASSWORD=root-password-456
NEXTAUTH_SECRET=chave-secreta-muito-longa-e-aleatoria
```

### Implantação via Container Manager

#### 1. Upload dos Ficheiros
```bash
# Via FileStation ou SCP
scp -r ./home-configurator/ admin@192.168.1.100:/volume1/docker/
```

#### 2. Criar Projeto no Container Manager
1. Abrir **Container Manager**
2. Ir para **Projeto**
3. Clicar **Criar**
4. Selecionar **Criar docker-compose.yml**
5. Colar o conteúdo do docker-compose.yml
6. Configurar variáveis de ambiente
7. Executar

#### 3. Configurar Proxy Reverso

**Via DSM > Painel de Controlo > Portal de Aplicações:**
```
Origem: *.synology.me
Protocolo: HTTPS
Porta: 443
Destino: localhost:3000
```

### Configuração SSL

#### Certificado Let's Encrypt
1. **DSM > Painel de Controlo > Segurança > Certificado**
2. **Adicionar > Obter certificado de Let's Encrypt**
3. **Domínio**: homeconfigurator.minha-nas.synology.me
4. **Email**: admin@exemplo.pt
5. **Aplicar**

---

## 🖥️ Deployment em VM Linux

### Preparação da VM

#### Especificações Recomendadas
- **OS**: Ubuntu 22.04 LTS ou CentOS 8+
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Disco**: 100GB SSD
- **Rede**: IP estático

#### Instalação de Dependências
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Instalar utilitários
sudo apt install git nginx certbot python3-certbot-nginx
```

### Configuração da Aplicação

#### 1. Clonar e Configurar
```bash
# Clonar repositório
git clone https://github.com/exemplo/home-configurator.git
cd home-configurator

# Configurar ambiente
cp .env.example .env
nano .env
```

#### 2. Docker Compose para Produção
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/public/uploads
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=homeconfigurator
      - MYSQL_USER=homeconfig
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./backups:/backups
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  db_data:
```

#### 3. Configuração Nginx
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name homeconfigurator.exemplo.pt;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name homeconfigurator.exemplo.pt;

        ssl_certificate /etc/letsencrypt/live/homeconfigurator.exemplo.pt/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/homeconfigurator.exemplo.pt/privkey.pem;

        client_max_body_size 50M;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Implantação

```bash
# Construir e iniciar
docker compose up -d

# Verificar status
docker compose ps

# Obter certificado SSL
sudo certbot --nginx -d homeconfigurator.exemplo.pt

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## ☁️ Deployment em Cloud

### Opções de Cloud

#### 1. DigitalOcean Droplet
```bash
# Criar droplet via doctl
doctl compute droplet create home-configurator \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region fra1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header)
```

#### 2. AWS EC2
```bash
# Lançar instância
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --count 1 \
  --instance-type t3.medium \
  --key-name minha-chave \
  --security-groups home-configurator-sg
```

#### 3. Azure VM
```bash
# Criar VM
az vm create \
  --resource-group home-configurator-rg \
  --name home-configurator-vm \
  --image UbuntuLTS \
  --size Standard_B2s \
  --admin-username azureuser \
  --ssh-key-values ~/.ssh/id_rsa.pub
```

### Configuração de Rede

#### Security Groups (AWS)
```json
{
  "SecurityGroupRules": [
    {
      "IpProtocol": "tcp",
      "FromPort": 22,
      "ToPort": 22,
      "CidrIp": "0.0.0.0/0"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 80,
      "ToPort": 80,
      "CidrIp": "0.0.0.0/0"
    },
    {
      "IpProtocol": "tcp",
      "FromPort": 443,
      "ToPort": 443,
      "CidrIp": "0.0.0.0/0"
    }
  ]
}
```

### Base de Dados Gerida

#### AWS RDS
```bash
# Criar instância RDS
aws rds create-db-instance \
  --db-instance-identifier home-configurator-db \
  --db-instance-class db.t3.micro \
  --engine mariadb \
  --master-username admin \
  --master-user-password MinhaPasswordSegura123 \
  --allocated-storage 20
```

#### DigitalOcean Managed Database
```bash
# Criar cluster
doctl databases create home-configurator-db \
  --engine mysql \
  --version 8 \
  --size db-s-1vcpu-1gb \
  --region fra1
```

---

## ⚙️ Configurações de Produção

### Variáveis de Ambiente

```env
# Produção
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db
NEXTAUTH_URL=https://homeconfigurator.exemplo.pt
NEXTAUTH_SECRET=chave-muito-segura-e-aleatoria-de-32-caracteres

# Segurança
ALLOWED_ORIGINS=https://homeconfigurator.exemplo.pt
CORS_CREDENTIALS=true

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/public/uploads

# Email (opcional)
SMTP_HOST=smtp.exemplo.pt
SMTP_PORT=587
SMTP_USER=noreply@exemplo.pt
SMTP_PASS=emailpassword

# Logs
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
```

### Otimizações Next.js

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 2592000, // 30 dias
  },
  experimental: {
    serverComponentsExternalPackages: ['prisma'],
  },
}
```

### Dockerfile Otimizado

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=base /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

---

## 🔒 SSL e Domínio

### Configuração DNS

```
# Registos DNS necessários
A    homeconfigurator.exemplo.pt    → IP_DO_SERVIDOR
AAAA homeconfigurator.exemplo.pt    → IPv6_DO_SERVIDOR (opcional)
CNAME www.homeconfigurator.exemplo.pt → homeconfigurator.exemplo.pt
```

### Let's Encrypt

```bash
# Obter certificado
sudo certbot --nginx -d homeconfigurator.exemplo.pt -d www.homeconfigurator.exemplo.pt

# Testar renovação
sudo certbot renew --dry-run

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'docker compose restart nginx'" | sudo crontab -
```

### Certificado Wildcard

```bash
# Para subdomínios
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d *.exemplo.pt
```

---

## 📊 Monitorização

### Health Checks

```bash
#!/bin/bash
# healthcheck.sh

# Verificar aplicação
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://homeconfigurator.exemplo.pt/api/health)

# Verificar base de dados
DB_STATUS=$(docker compose exec -T db mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD)

# Alertas
if [ $APP_STATUS -ne 200 ]; then
    echo "APP DOWN" | mail -s "Alert: App Down" admin@exemplo.pt
fi

if [[ $DB_STATUS != *"mysqld is alive"* ]]; then
    echo "DB DOWN" | mail -s "Alert: DB Down" admin@exemplo.pt
fi
```

### Logs Centralizados

```yaml
# Adicionar ao docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Métricas com Prometheus (Opcional)

```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/home-configurator
            git pull origin main
            docker compose build app
            docker compose up -d
```

---

*Para suporte adicional: admin@homeconfigurator.pt* 