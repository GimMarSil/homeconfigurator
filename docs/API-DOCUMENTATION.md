# Home Configurator - Documentação da API

## 📖 Índice
1. [Introdução](#introdução)
2. [Autenticação](#autenticação)
3. [Estrutura de Resposta](#estrutura-de-resposta)
4. [Códigos de Estado](#códigos-de-estado)
5. [Endpoints da API](#endpoints-da-api)
   - [Clientes](#clientes)
   - [Edifícios](#edifícios)
   - [Zonas](#zonas)
   - [Materiais](#materiais)
   - [Tipos de Material](#tipos-de-material)
   - [Zonas Tipo](#zonas-tipo)
   - [Materiais Selecionados](#materiais-selecionados)
6. [Modelos de Dados](#modelos-de-dados)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## 🌟 Introdução

A API do Home Configurator é uma API REST que permite integração completa com todas as funcionalidades da plataforma. Esta documentação cobre todos os endpoints disponíveis, formatos de dados e exemplos de uso.

### URL Base
```
https://homeconfigurator.exemplo.pt/api
```

### Formato de Dados
- **Request**: JSON
- **Response**: JSON
- **Codificação**: UTF-8

---

## 🔐 Autenticação

A API utiliza autenticação baseada em sessões através do NextAuth.js.

### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "utilizador@exemplo.pt",
  "password": "minhapassword123"
}
```

### Headers Obrigatórios
Todas as requisições autenticadas devem incluir:
```http
Cookie: next-auth.session-token=...
```

---

## 📋 Estrutura de Resposta

### Resposta de Sucesso
```json
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}
```

### Resposta de Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": [...]
  }
}
```

---

## 📊 Códigos de Estado

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicação) |
| 500 | Erro interno do servidor |

---

## 🏢 Clientes

### Listar Clientes
```http
GET /api/clientes
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@exemplo.pt",
      "telefone": "+351 912 345 678",
      "morada": "Rua das Flores, 123, Lisboa",
      "nif": "123456789",
      "status": "ATIVO",
      "criadoEm": "2024-01-01T10:00:00Z",
      "edificios": [...]
    }
  ]
}
```

### Obter Cliente por ID
```http
GET /api/clientes/{id}
```

### Criar Cliente
```http
POST /api/clientes
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@exemplo.pt",
  "telefone": "+351 913 456 789",
  "morada": "Avenida da República, 456, Porto",
  "nif": "987654321"
}
```

### Atualizar Cliente
```http
PUT /api/clientes/{id}
Content-Type: application/json

{
  "nome": "Maria Santos Silva",
  "telefone": "+351 914 567 890"
}
```

### Eliminar Cliente
```http
DELETE /api/clientes/{id}
```

---

## 🏗️ Edifícios

### Listar Edifícios
```http
GET /api/edificios
```

**Parâmetros de Query:**
- `clienteId`: Filtrar por cliente específico

### Obter Edifício por ID
```http
GET /api/edificios/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Moradia em Cascais",
    "morada": "Rua do Mar, 789, Cascais",
    "tipologia": "T4",
    "nPisos": 2,
    "areaBruta": 250.5,
    "anoConstrucao": 2024,
    "plantaImagem": "/uploads/planta-123.jpg",
    "estado": "EM_CURSO",
    "clienteId": 1,
    "cliente": {
      "id": 1,
      "nome": "João Silva"
    },
    "zonasEspecificas": [...]
  }
}
```

### Criar Edifício
```http
POST /api/edificios
Content-Type: multipart/form-data

nome: Casa da Praia
clienteId: 1
morada: Rua da Praia, 123
tipologia: T3
nPisos: 1
areaBruta: 180.0
anoConstrucao: 2024
plantaImagem: [FILE]
```

### Atualizar Edifício
```http
PUT /api/edificios/{id}
```

### Eliminar Edifício
```http
DELETE /api/edificios/{id}
```

---

## 🏠 Zonas

### Listar Zonas
```http
GET /api/zonas
```

**Parâmetros de Query:**
- `edificioId`: Filtrar por edifício
- `estado`: Filtrar por estado (PENDENTE, EM_PROGRESSO, CONCLUIDO)

### Obter Zona por ID
```http
GET /api/zonas/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Cozinha Principal",
    "area": 25.5,
    "estado": "EM_PROGRESSO",
    "zonaTipoId": 1,
    "edificioId": 1,
    "zonaTipo": {
      "id": 1,
      "nome": "Cozinha",
      "categoria": "AREA_HUMIDA"
    },
    "edificio": {
      "id": 1,
      "nome": "Moradia em Cascais",
      "cliente": {
        "nome": "João Silva"
      }
    },
    "materiaisSelecionados": [
      {
        "id": 1,
        "quantidade": 15.0,
        "precoUnitario": 25.50,
        "observacoes": "Azulejo para parede",
        "material": {
          "nome": "Azulejo Branco 30x60",
          "marca": "Cerâmica Portugal"
        }
      }
    ]
  }
}
```

### Criar Zona
```http
POST /api/zonas
Content-Type: application/json

{
  "nome": "Sala de Estar",
  "area": 35.0,
  "estado": "PENDENTE",
  "zonaTipoId": 2,
  "edificioId": 1
}
```

### Atualizar Zona
```http
PUT /api/zonas/{id}
Content-Type: application/json

{
  "nome": "Sala de Estar Principal",
  "area": 38.5,
  "estado": "EM_PROGRESSO"
}
```

### Eliminar Zona
```http
DELETE /api/zonas/{id}
```

---

## 🧱 Materiais

### Listar Materiais
```http
GET /api/materiais
```

**Parâmetros de Query:**
- `tipoMaterialId`: Filtrar por tipo de material
- `disponivel`: Filtrar por disponibilidade (true/false)
- `search`: Pesquisar por nome ou marca

### Obter Material por ID
```http
GET /api/materiais/{id}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Azulejo Branco 30x60",
    "referencia": "AZ-30x60-BR",
    "marca": "Cerâmica Portugal",
    "descricao": "Azulejo cerâmico branco para revestimento de paredes",
    "precoUnitario": 25.50,
    "fornecedor": "Distribuidora Azulejos Lda",
    "urlFabricante": "https://ceramicaportugal.pt/az-30x60-br",
    "imagem": "/uploads/azulejo-branco.jpg",
    "fichaTecnica": "/uploads/ficha-azulejo-branco.pdf",
    "disponivel": true,
    "tipoMaterialId": 1,
    "tipoMaterial": {
      "id": 1,
      "nome": "Azulejo",
      "categoria": "Revestimento",
      "unidadeMedida": "m²"
    }
  }
}
```

### Criar Material
```http
POST /api/materiais
Content-Type: multipart/form-data

nome: Piso Laminado Carvalho
tipoMaterialId: 2
referencia: PL-CARV-8MM
marca: FloorTech
descricao: Piso laminado imitação carvalho, 8mm espessura
precoUnitario: 35.90
fornecedor: Pavimentos Premium
disponivel: true
imagem: [FILE]
fichaTecnica: [FILE]
```

### Atualizar Material
```http
PUT /api/materiais/{id}
```

### Eliminar Material
```http
DELETE /api/materiais/{id}
```

---

## 🎯 Tipos de Material

### Listar Tipos de Material
```http
GET /api/tipos-material
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Azulejo",
      "categoria": "Revestimento",
      "unidadeMedida": "m²",
      "descricao": "Revestimentos cerâmicos para paredes"
    }
  ]
}
```

### Criar Tipo de Material
```http
POST /api/tipos-material
Content-Type: application/json

{
  "nome": "Tinta",
  "categoria": "Acabamento",
  "unidadeMedida": "L",
  "descricao": "Tintas para paredes e tectos"
}
```

---

## 🏘️ Zonas Tipo

### Listar Zonas Tipo
```http
GET /api/zonas-tipo
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Cozinha",
      "categoria": "AREA_HUMIDA",
      "descricao": "Zona de preparação de alimentos"
    }
  ]
}
```

### Criar Zona Tipo
```http
POST /api/zonas-tipo
Content-Type: application/json

{
  "nome": "Suite",
  "categoria": "QUARTO",
  "descricao": "Quarto principal com casa de banho privativa"
}
```

---

## 🎨 Materiais Selecionados

### Listar Materiais de uma Zona
```http
GET /api/zonas/{zonaId}/materiais
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "materiaisSelecionados": [
      {
        "id": 1,
        "quantidade": 15.0,
        "precoUnitario": 25.50,
        "observacoes": "Para parede da cozinha",
        "material": {
          "id": 1,
          "nome": "Azulejo Branco 30x60",
          "imagem": "/uploads/azulejo-branco.jpg"
        }
      }
    ],
    "materiaisDisponiveis": [...]
  }
}
```

### Adicionar Material à Zona
```http
POST /api/zonas/{zonaId}/materiais
Content-Type: application/json

{
  "materialId": 1,
  "quantidade": 20.0,
  "precoUnitario": 25.50,
  "observacoes": "Material para revestimento da parede principal"
}
```

### Atualizar Material Selecionado
```http
PUT /api/materiais-selecionados/{id}
Content-Type: application/json

{
  "quantidade": 18.5,
  "precoUnitario": 24.90,
  "observacoes": "Quantidade ajustada após medição final"
}
```

### Remover Material da Zona
```http
DELETE /api/materiais-selecionados/{id}
```

---

## 📊 Modelos de Dados

### Cliente
```typescript
interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  morada?: string;
  nif?: string;
  status: 'ATIVO' | 'INATIVO';
  criadoEm: string;
  atualizadoEm: string;
  edificios?: Edificio[];
}
```

### Edifício
```typescript
interface Edificio {
  id: number;
  nome: string;
  morada: string;
  tipologia?: string;
  nPisos: number;
  areaBruta?: number;
  anoConstrucao?: number;
  plantaImagem?: string;
  estado: 'EM_CURSO' | 'FINALIZADO' | 'PAUSADO';
  clienteId: number;
  cliente?: Cliente;
  zonasEspecificas?: ZonaEspecifica[];
}
```

### Zona Específica
```typescript
interface ZonaEspecifica {
  id: number;
  nome: string;
  area: number;
  estado: 'PENDENTE' | 'EM_PROGRESSO' | 'CONCLUIDO';
  zonaTipoId: number;
  edificioId: number;
  zonaTipo?: ZonaTipo;
  edificio?: Edificio;
  materiaisSelecionados?: MaterialSelecionado[];
}
```

### Material
```typescript
interface Material {
  id: number;
  nome: string;
  referencia?: string;
  marca?: string;
  descricao?: string;
  precoUnitario: number;
  fornecedor?: string;
  urlFabricante?: string;
  imagem?: string;
  fichaTecnica?: string;
  disponivel: boolean;
  tipoMaterialId: number;
  tipoMaterial?: TipoMaterial;
}
```

### Material Selecionado
```typescript
interface MaterialSelecionado {
  id: number;
  quantidade: number;
  precoUnitario: number;
  observacoes?: string;
  materialId: number;
  zonaId: number;
  material?: Material;
  zona?: ZonaEspecifica;
}
```

---

## 🧪 Exemplos de Uso

### Fluxo Completo: Criar Projeto
```javascript
// 1. Criar cliente
const cliente = await fetch('/api/clientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Ana Costa',
    email: 'ana@exemplo.pt'
  })
});

// 2. Criar edifício
const edificio = await fetch('/api/edificios', {
  method: 'POST',
  body: formData // incluindo plantaImagem
});

// 3. Criar zona
const zona = await fetch('/api/zonas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Cozinha',
    area: 25.0,
    zonaTipoId: 1,
    edificioId: edificio.id
  })
});

// 4. Adicionar material à zona
const materialSelecionado = await fetch(`/api/zonas/${zona.id}/materiais`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    materialId: 1,
    quantidade: 15.0,
    precoUnitario: 25.50
  })
});
```

### Buscar Dados com Relacionamentos
```javascript
// Obter zona com todos os dados relacionados
const zona = await fetch('/api/zonas/1');
// Retorna: zona + zonaTipo + edificio + cliente + materiaisSelecionados

// Obter materiais disponíveis para uma zona
const materiais = await fetch('/api/zonas/1/materiais');
// Retorna: materiaisSelecionados + materiaisDisponiveis
```

### Cálculo de Custos
```javascript
// Os cálculos são automáticos nas respostas da API
const zona = await fetch('/api/zonas/1').then(r => r.json());

// Custo total da zona
const custoTotal = zona.data.materiaisSelecionados.reduce(
  (total, item) => total + (item.quantidade * item.precoUnitario), 0
);

// Custo por m²
const custoPorM2 = custoTotal / zona.data.area;
```

---

## 🔧 Tratamento de Erros

### Erro de Validação
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      },
      {
        "field": "area",
        "message": "Área deve ser um número positivo"
      }
    ]
  }
}
```

### Erro de Conflito
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Material já selecionado para esta zona"
  }
}
```

### Erro de Não Encontrado
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Zona não encontrada"
  }
}
```

---

## 📈 Rate Limiting

A API implementa rate limiting para prevenir abuso:
- **100 requisições por minuto** por IP
- **1000 requisições por hora** por utilizador autenticado

Headers de resposta incluem:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔄 Versionamento

A API utiliza versionamento semântico:
- **v1.0**: Versão inicial com CRUD básico
- **v2.0**: Adição de upload de ficheiros
- **v3.0**: Sistema completo de zonas e materiais (atual)

Header de versão:
```http
API-Version: 3.0
```

---

*Documentação atualizada em: Dezembro 2024* 