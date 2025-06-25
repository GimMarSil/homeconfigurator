# Scraper Porcelanosa - Home Configurator

## Funcionalidade Implementada

O sistema agora inclui um **scraper automático da Porcelanosa** que permite extrair automaticamente todas as informações de produtos diretamente do website da Porcelanosa.

## Como Usar

### 1. Aceder à Página de Materiais
- Navegue para `/dashboard/materiais`
- Clique no botão **"Novo Material"**

### 2. Usar o Scraper
- No diálogo de criação de material, verá um botão **"Scraper Porcelanosa"**
- Clique no botão para abrir o scraper
- Cole a URL do produto da Porcelanosa (ex: `https://productfinder.porcelanosagrupo.com/pt/revestimentos_ceramicos/cosmos_s1_white_g.html`)
- Clique em **"Extrair"**

### 3. Revisar e Criar
- O scraper irá extrair automaticamente:
  - **Nome do produto**
  - **Referência**
  - **Descrição**
  - **Características técnicas**
  - **Informações de embalagem**
  - **Informações de instalação**
  - **Todas as imagens do produto**
  - **Documentos técnicos** (fichas técnicas, garantias, etc.)

- Revise os dados extraídos nas abas:
  - **Formulário**: Dados principais do material
  - **Características**: Especificações técnicas
  - **Embalagem**: Informações de embalagem
  - **Instalação**: Dados de instalação

- Ajuste o **Tipo de Material** se necessário
- Clique em **"Criar Material"**

## Funcionalidades do Scraper

### ✅ Extração Automática
- **Dados do produto**: Nome, referência, descrição
- **Características técnicas**: Todas as especificações
- **Imagens**: Download automático de todas as imagens
- **Documentos**: Fichas técnicas, garantias, instruções
- **Informações de embalagem**: Dados de embalagem e paletes
- **Instruções de instalação**: Adesivos, juntas recomendadas

### ✅ Processamento Inteligente
- **Seletores múltiplos**: Tenta vários seletores para encontrar dados
- **Fallback automático**: Se não encontrar dados em tabelas, procura em listas
- **Filtros de imagem**: Evita placeholders e imagens de loading
- **Categorização de documentos**: Identifica automaticamente o tipo de documento

### ✅ Armazenamento na NAS
- **Imagens**: Salvas em `/public/uploads/materiais/`
- **Documentos**: Organizados por categoria
- **Base de dados**: Todos os ficheiros registados na tabela `ficheiros`
- **Carrossel**: As imagens aparecem automaticamente no carrossel do material

## Estrutura dos Dados Extraídos

### Características Técnicas
- Tipo de produto
- Família
- Formato
- Espessura
- Localização
- Uso
- Acabamento
- Absorção de água
- Variações de tom
- Retificado
- Relevo
- Bookmatch

### Embalagem
- Unidade de venda
- Unidade por caixa
- M² por caixa
- M² por palete
- Peso bruto
- Peso líquido

### Instalação
- Adesivo recomendado
- Adesivo para zona molhada
- Junta recomendada
- Junta para zona molhada

## APIs Criadas

### `/api/scraper/porcelanosa`
- **Método**: POST
- **Autenticação**: Requerida
- **Parâmetros**: `{ url: string }`
- **Retorna**: Dados completos do produto extraído

### `/api/upload/material`
- **Método**: POST
- **Autenticação**: Requerida
- **Parâmetros**: `{ materialId: number, url: string, categoria: string, descricao: string }`
- **Função**: Faz download e upload de ficheiros por URL

## Dependências Instaladas

- `puppeteer`: Para fazer scraping do website
- `uuid`: Para gerar nomes únicos de ficheiros
- `node-fetch`: Para testes (opcional)

## Segurança

- **Autenticação obrigatória**: Todas as APIs requerem autenticação
- **Validação de URL**: Apenas URLs da Porcelanosa são aceites
- **Sanitização**: Todos os dados são validados antes de serem salvos
- **Isolamento**: O scraper corre em um browser isolado

## Troubleshooting

### Erro de Autenticação
- Certifique-se de que está autenticado no sistema
- Verifique se o cookie de autenticação está presente

### Erro de Extração
- Verifique se a URL é válida da Porcelanosa
- Alguns produtos podem ter estrutura diferente
- Tente com outro produto se o primeiro falhar

### Erro de Download
- Verifique a conectividade com a internet
- Alguns ficheiros podem estar protegidos
- O sistema continuará mesmo se alguns ficheiros falharem

## Exemplo de Uso

1. **URL de teste**: `https://productfinder.porcelanosagrupo.com/pt/revestimentos_ceramicos/cosmos_s1_white_g.html`

2. **Dados extraídos**:
   - Nome: "COSMOS S1 WHITE G"
   - Referência: "COSMOS S1 WHITE G"
   - Características: 12 campos técnicos
   - Embalagem: 6 campos de embalagem
   - Instalação: 4 campos de instalação
   - Imagens: Múltiplas imagens do produto
   - Documentos: Fichas técnicas e garantias

3. **Resultado**: Material criado automaticamente com todas as informações e ficheiros organizados

## Notas Técnicas

- O scraper usa **Puppeteer** para renderizar páginas JavaScript
- **Seletores CSS** múltiplos para máxima compatibilidade
- **Download automático** de imagens e documentos
- **Organização automática** de ficheiros por categoria
- **Integração completa** com o sistema de materiais existente

## Próximas Melhorias

- [ ] Suporte para outros fornecedores
- [ ] Extração de preços (se disponível)
- [ ] Cache de dados extraídos
- [ ] Interface de gestão de scrapers
- [ ] Relatórios de extração 