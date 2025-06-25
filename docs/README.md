# Home Configurator - Documentação

## 📋 Índice da Documentação

Esta é a documentação completa do **Home Configurator**, uma plataforma SaaS para gabinetes de arquitetura gerirem clientes, edifícios, zonas e materiais de acabamento.

---

## 📚 Documentos Disponíveis

### 📖 Para Utilizadores
- **[Guia do Utilizador](USER-GUIDE.md)** - Manual completo para utilizadores finais
  - Primeiros passos e login
  - Gestão de clientes, edifícios e zonas
  - Sistema de comparação de materiais
  - Dicas e melhores práticas

### 🔧 Para Administradores
- **[Guia do Administrador](ADMIN-GUIDE.md)** - Manual para administradores de sistema
  - Instalação e configuração
  - Gestão de utilizadores
  - Configuração da base de dados
  - Segurança e monitorização
  - Backup e recuperação
  - Troubleshooting

### 🚀 Para Deployment
- **[Guia de Deployment](DEPLOYMENT-GUIDE.md)** - Instruções detalhadas de implantação
  - Deployment em NAS Synology
  - Deployment em VM Linux
  - Deployment em Cloud (AWS, Azure, DigitalOcean)
  - Configurações de produção
  - SSL e domínio

### 🛠️ Para Desenvolvedores
- **[Documentação da API](API-DOCUMENTATION.md)** - Referência completa da API REST
  - Endpoints de todas as entidades
  - Modelos de dados TypeScript
  - Exemplos de uso
  - Códigos de erro e tratamento
  - Rate limiting e autenticação

---

## 🏗️ Arquitetura da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Configurator                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + React + TypeScript + Tailwind CSS)    │
├─────────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes + Prisma ORM)                 │
├─────────────────────────────────────────────────────────────┤
│  Base de Dados (MariaDB/MySQL)                             │
└─────────────────────────────────────────────────────────────┘
```

### Tecnologias Utilizadas
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Dados**: MariaDB/MySQL
- **Autenticação**: NextAuth.js
- **Deployment**: Docker, Docker Compose

---

## 🚀 Início Rápido

### Para Utilizadores
1. Aceda ao sistema através do URL fornecido
2. Faça login com as suas credenciais
3. Consulte o [Guia do Utilizador](USER-GUIDE.md) para instruções detalhadas

### Para Administradores
1. Consulte o [Guia do Administrador](ADMIN-GUIDE.md) para configuração inicial
2. Configure utilizadores e permissões
3. Monitorize o sistema regularmente

### Para Desenvolvimento
1. Clone o repositório
2. Configure as variáveis de ambiente
3. Execute `npm install && npm run dev`
4. Consulte a [Documentação da API](API-DOCUMENTATION.md) para integração

---

## 📦 Funcionalidades Principais

### ✅ Gestão de Clientes
- Cadastro completo de clientes
- Informações de contacto e NIF
- Estados ativos/inativos
- Histórico de atividades

### ✅ Gestão de Edifícios
- Associação a clientes
- Upload de plantas
- Informações técnicas (tipologia, pisos, área)
- Estados de projeto (em curso, finalizado, pausado)

### ✅ Gestão de Zonas
- Divisão de edifícios em zonas específicas
- Tipos de zona (cozinha, sala, quarto, etc.)
- Área e estados de progresso
- Cálculos automáticos de custos

### ✅ Catálogo de Materiais
- Base de dados completa de materiais
- Upload de imagens e fichas técnicas
- Organização por categorias
- Preços e fornecedores

### ✅ Sistema de Comparação
- Comparação lado-a-lado de materiais
- Interface modal intuitiva
- Especificações técnicas detalhadas
- Cálculos de custos automáticos

### ✅ Orçamentação
- Cálculo automático por zona
- Custo por metro quadrado
- Total por edifício
- Exportação de relatórios

---

## 🎯 Casos de Uso

### Gabinetes de Arquitetura
- Gestão centralizada de projetos
- Apresentação de opções aos clientes
- Orçamentação precisa
- Acompanhamento de progresso

### Designers de Interiores
- Seleção de materiais
- Comparação de opções
- Cálculo de custos
- Propostas profissionais

### Construtoras
- Especificação de materiais
- Controlo de custos
- Gestão de fornecedores
- Acompanhamento de obras

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| **Páginas** | 15+ páginas funcionais |
| **API Endpoints** | 25+ endpoints REST |
| **Modelos de Dados** | 8 entidades principais |
| **Componentes UI** | 50+ componentes reutilizáveis |
| **Funcionalidades** | 100% das especificações |

---

## 🔄 Histórico de Versões

### v3.0 (Atual) - Dezembro 2024
- ✅ Sistema completo de gestão de zonas e materiais
- ✅ Comparador de materiais lado-a-lado
- ✅ Orçamentação automática
- ✅ Interface melhorada e responsiva
- ✅ 15 novos endpoints API
- ✅ Documentação completa

### v2.0 - Novembro 2024
- ✅ Gestão básica de entidades (CRUD)
- ✅ Upload de ficheiros
- ✅ Autenticação de utilizadores
- ✅ Base de dados estruturada

### v1.0 - Outubro 2024
- ✅ Setup inicial da stack
- ✅ Configuração do ambiente
- ✅ Estrutura base do projeto

---

## 📞 Suporte e Contactos

### Suporte Técnico
- **Email Geral**: suporte@homeconfigurator.pt
- **Email Admin**: admin@homeconfigurator.pt
- **Telefone**: +351 XXX XXX XXX

### Desenvolvimento
- **Repositório**: https://github.com/exemplo/home-configurator
- **Issues**: https://github.com/exemplo/home-configurator/issues
- **Wiki**: https://github.com/exemplo/home-configurator/wiki

### Horários de Suporte
- **Segunda a Sexta**: 9h00 - 18h00
- **Emergências**: 24/7 (apenas para utilizadores premium)

---

## 📄 Licença

Este projeto está disponível sob os termos da [Licença MIT](../LICENSE).
Sinta‑se livre para utilizar e modificar o software de acordo com os termos dessa licença.

---

## 🙏 Agradecimentos

### Equipa de Desenvolvimento
- **Arquiteto de Software**: Gilberto Marques Silva
- **Frontend**: React/Next.js Team
- **Backend**: Node.js/Prisma Team
- **DevOps**: Docker/Infrastructure Team

### Tecnologias e Ferramentas
- **Vercel**: Por criar o excelente Next.js
- **Prisma**: Pela fantástica ferramenta ORM
- **Tailwind CSS**: Pelo framework CSS utilitário
- **MariaDB**: Pela base de dados robusta

---

## 🔗 Links Úteis

### Documentação Externa
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Recursos de Aprendizagem
- [React Learning Path](https://reactjs.org/docs/getting-started.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Docker Getting Started](https://docs.docker.com/get-started)

---

## 📝 Changelog

Para ver o histórico detalhado de alterações, consulte:
- [IMPLEMENTACAO-FASE1-COMPLETA.md](../IMPLEMENTACAO-FASE1-COMPLETA.md)
- [IMPLEMENTACAO-FASE2-COMPLETA.md](../IMPLEMENTACAO-FASE2-COMPLETA.md)
- [IMPLEMENTACAO-FASE3-COMPLETA.md](../IMPLEMENTACAO-FASE3-COMPLETA.md)

---

*Documentação atualizada em: Dezembro 2024*
*Versão da documentação: 3.0* 