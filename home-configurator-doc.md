
# Home Configurator – Documento de Arquitetura e Funcionalidades

## 🎯 Objetivo do Projeto

O **Home Configurator** é uma aplicação web SaaS destinada a gabinetes de arquitetura, que permite gerir clientes, edifícios, zonas e materiais de acabamento. O objetivo é fornecer uma plataforma onde os clientes possam configurar os seus edifícios, visualizar fichas técnicas, comparar materiais e receber propostas personalizadas.

---

## 🧱 Arquitetura da Aplicação

### Tecnologias Utilizadas
- **Next.js (App Router)** com TypeScript
- **Tailwind CSS** para estilização
- **Prisma ORM** para acesso à base de dados
- **MariaDB** como SGBD (pode correr numa NAS Synology)
- **Autenticação com NextAuth.js**
- **pnpm workspaces** (suporte monorepo tipo Turborepo)
- **Componentização** por design modular

### Organização das Pastas (trecho)
```
/app
  ├── dashboard/
  │   ├── clientes/
  │   ├── edificios/
  │   ├── materiais/
  ├── layout.tsx
  ├── page.tsx
/components.json
/package.json
/tailwind.config.ts
```

---

## 📐 Estrutura Funcional

### Utilizadores
- Login com email + palavra-passe
- Role: administrador / cliente

### Gestão de Clientes
- Criar / editar / remover clientes
- Ver lista de edifícios por cliente

### Gestão de Edifícios
- Criar / editar / remover edifícios
- Upload da planta
- Ver zonas do edifício

### Gestão de Zonas
- Tabela de zonas com tipo, área, estado
- Acesso à seleção de materiais por zona

### Materiais
- Lista de materiais por categoria
- Upload de imagem e ficha técnica (PDF)
- Filtros por tipo, fornecedor
- Comparação lado-a-lado entre opções

### Comparação e Orçamentação
- Modal de comparação com imagem, dados técnicos e preço por m²
- Cálculo automático de custos por zona e edifício
- Exportação para Excel ou PDF

---

## 🧭 Navegação Prevista

- `/dashboard`
- `/dashboard/clientes`
- `/dashboard/clientes/[id]`
- `/dashboard/edificios`
- `/dashboard/edificios/[id]`
- `/dashboard/materiais`
- `/dashboard/zona/[id]/materiais`
- `/dashboard/comparar` *(modal ou página)*

---

## 🚧 Roadmap de Implementação

### Fase 1 – Setup
- Ambiente Next.js + Tailwind + Prisma + DB
- Login funcional com NextAuth
- Migração inicial (clientes, utilizadores, edifícios)

### Fase 2 – CRUD Base
- CRUD completo de clientes, edifícios, zonas, materiais
- Upload funcional de imagens e PDFs

### Fase 3 – Comparador
- Seletor de materiais por zona
- Modal de comparação lado a lado
- Estado de “selecionado” por zona

### Fase 4 – Orçamento e Exportação
- Tabela de resumo de custos por zona/edifício
- Exportação para Excel/PDF
- Gráfico de barras (Recharts)

### Fase 5 – Deploy e Testes
- Dockerfile + Docker Compose
- Deploy na NAS ou VM
- Testes manuais e unitários

---

## 🧩 Considerações Técnicas

- Os ficheiros estão organizados por rota em `/app/dashboard`
- Os componentes partilhados devem ser movidos para `packages/ui`
- A autenticação deve limitar acesso a `/dashboard` por role
- As rotas futuras devem aproveitar `Server Components` para SSR rápido
- Estado global (cliente atual, edifício selecionado) pode ser gerido via Context

---

## 📎 Ficheiros Existentes na Maquete

```plaintext
- app/dashboard/clientes/page.tsx
- app/dashboard/clientes/[id]/page.tsx
- app/dashboard/edificios/page.tsx
- app/dashboard/materiais/page.tsx
```

---

## ✍️ Autor
Gilberto Marques Silva

Documentação gerada automaticamente com base no protótipo inicial.
