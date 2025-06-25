-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `morada` VARCHAR(191) NULL,
    `nif` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `plano` ENUM('BASICO', 'PROFISSIONAL', 'ENTERPRISE') NOT NULL DEFAULT 'BASICO',
    `maxEdificios` INTEGER NOT NULL DEFAULT 5,
    `maxUtilizadores` INTEGER NOT NULL DEFAULT 10,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clientes_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilizadores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'GESTOR', 'VISUALIZADOR', 'SUPER_ADMIN') NOT NULL DEFAULT 'VISUALIZADOR',
    `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
    `ultimoAcesso` DATETIME(3) NULL,
    `clienteId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilizadores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edificios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `morada` VARCHAR(191) NOT NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `tipologia` VARCHAR(191) NULL,
    `nPisos` INTEGER NOT NULL DEFAULT 1,
    `areaBruta` DOUBLE NULL,
    `anoConstrucao` INTEGER NULL,
    `plantaImagem` VARCHAR(191) NULL,
    `estado` ENUM('EM_CURSO', 'FINALIZADO', 'PAUSADO') NOT NULL DEFAULT 'EM_CURSO',
    `descricao` VARCHAR(191) NULL,
    `prazoExecucao` DATETIME(3) NULL,
    `orcamentoTotal` DOUBLE NULL,
    `clienteId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas_tipo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `categoria` ENUM('HABITACIONAL', 'TECNICO', 'EXTERIOR', 'CIRCULACAO', 'SERVICOS') NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `zonas_tipo_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zonas_especificas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `area` DOUBLE NOT NULL,
    `pe` DOUBLE NULL,
    `estado` ENUM('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDO') NOT NULL DEFAULT 'PENDENTE',
    `estadoAprovacao` ENUM('RASCUNHO', 'SUBMETIDO', 'EM_REVISAO', 'APROVADO', 'REJEITADO', 'APROVADO_COM_CONDICOES') NOT NULL DEFAULT 'RASCUNHO',
    `observacoes` VARCHAR(191) NULL,
    `imagemIdentificacao` VARCHAR(191) NULL,
    `orcamentoEstimado` DOUBLE NULL,
    `zonaTipoId` INTEGER NOT NULL,
    `edificioId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `unidadeMedida` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tipos_material_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `referencia` VARCHAR(191) NULL,
    `marca` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `precoUnitario` DOUBLE NOT NULL DEFAULT 0,
    `fornecedor` VARCHAR(191) NULL,
    `urlFabricante` VARCHAR(191) NULL,
    `imagem` VARCHAR(191) NULL,
    `fichaTecnica` VARCHAR(191) NULL,
    `disponivel` BOOLEAN NOT NULL DEFAULT true,
    `isGlobal` BOOLEAN NOT NULL DEFAULT true,
    `aprovado` BOOLEAN NOT NULL DEFAULT false,
    `motivoRejeicao` VARCHAR(191) NULL,
    `tipoMaterialId` INTEGER NOT NULL,
    `clienteId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `materiais_referencia_key`(`referencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materiais_selecionados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` DOUBLE NOT NULL DEFAULT 1,
    `precoUnitario` DOUBLE NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `materialId` INTEGER NOT NULL,
    `zonaId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    UNIQUE INDEX `materiais_selecionados_materialId_zonaId_key`(`materialId`, `zonaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zona_tipo_materiais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zonaTipoId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,

    UNIQUE INDEX `zona_tipo_materiais_zonaTipoId_materialId_key`(`zonaTipoId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conteudo` VARCHAR(191) NOT NULL,
    `tipo` ENUM('GERAL', 'DUVIDA', 'SUGESTAO', 'PROBLEMA', 'APROVACAO', 'REJEICAO', 'INFORMACAO') NOT NULL DEFAULT 'GERAL',
    `prioridade` ENUM('BAIXA', 'NORMAL', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'NORMAL',
    `resolvido` BOOLEAN NOT NULL DEFAULT false,
    `privado` BOOLEAN NOT NULL DEFAULT false,
    `utilizadorId` INTEGER NOT NULL,
    `clienteId` INTEGER NOT NULL,
    `edificioId` INTEGER NULL,
    `zonaId` INTEGER NULL,
    `materialId` INTEGER NULL,
    `comentarioPaiId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_aprovacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acao` ENUM('SUBMETER', 'APROVAR', 'REJEITAR', 'SOLICITAR_REVISAO', 'APROVAR_COM_CONDICOES') NOT NULL,
    `estadoAnterior` ENUM('RASCUNHO', 'SUBMETIDO', 'EM_REVISAO', 'APROVADO', 'REJEITADO', 'APROVADO_COM_CONDICOES') NOT NULL,
    `estadoNovo` ENUM('RASCUNHO', 'SUBMETIDO', 'EM_REVISAO', 'APROVADO', 'REJEITADO', 'APROVADO_COM_CONDICOES') NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `utilizadorId` INTEGER NOT NULL,
    `zonaId` INTEGER NOT NULL,
    `materialId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_decisoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `tipo` ENUM('MATERIAL_ALTERADO', 'ZONA_MODIFICADA', 'ORCAMENTO_AJUSTADO', 'PRAZO_ALTERADO', 'ESPECIFICACAO_TECNICA', 'APROVACAO_CLIENTE') NOT NULL,
    `impacto` ENUM('BAIXO', 'MEDIO', 'ALTO', 'CRITICO') NOT NULL DEFAULT 'BAIXO',
    `custoAdicional` DOUBLE NULL,
    `prazoAdicional` INTEGER NULL,
    `utilizadorId` INTEGER NOT NULL,
    `edificioId` INTEGER NOT NULL,
    `zonaId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notificacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `mensagem` VARCHAR(191) NOT NULL,
    `tipo` ENUM('NOVA_SUBMISSAO', 'APROVACAO', 'REJEICAO', 'COMENTARIO', 'PRAZO_PROXIMO', 'ORCAMENTO_EXCEDIDO', 'DOCUMENTO_ADICIONADO', 'SISTEMA') NOT NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `url` VARCHAR(191) NULL,
    `clienteId` INTEGER NOT NULL,
    `remetenteId` INTEGER NULL,
    `destinatarioId` INTEGER NULL,
    `edificioId` INTEGER NULL,
    `zonaId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lidaEm` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ficheiros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeOriginal` VARCHAR(191) NOT NULL,
    `nomeArquivo` VARCHAR(191) NOT NULL,
    `caminho` VARCHAR(191) NOT NULL,
    `tamanho` INTEGER NOT NULL,
    `tipoMime` VARCHAR(191) NOT NULL,
    `categoria` ENUM('PLANTA_EDIFICIO', 'DESENHO_TECNICO', 'DOCUMENTO_LEGAL', 'FOTO_ZONA', 'FICHA_TECNICA', 'IMAGEM_MATERIAL', 'CERTIFICACAO', 'MANUAL_INSTALACAO', 'GARANTIA', 'OUTROS') NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `edificioId` INTEGER NULL,
    `zonaId` INTEGER NULL,
    `materialId` INTEGER NULL,
    `comentarioId` INTEGER NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `selecoes_material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` DOUBLE NOT NULL DEFAULT 1,
    `precoUnitario` DOUBLE NOT NULL,
    `precoTotal` DOUBLE NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `estado` ENUM('RASCUNHO', 'SUBMETIDO', 'EM_REVISAO', 'APROVADO', 'REJEITADO', 'APROVADO_COM_CONDICOES') NOT NULL DEFAULT 'RASCUNHO',
    `zonaId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `dataSelecao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAprovacao` DATETIME(3) NULL,
    `aprovadoPor` VARCHAR(191) NULL,
    `motivoRejeicao` VARCHAR(191) NULL,

    UNIQUE INDEX `selecoes_material_zonaId_materialId_key`(`zonaId`, `materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `utilizadores` ADD CONSTRAINT `utilizadores_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edificios` ADD CONSTRAINT `edificios_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zonas_especificas` ADD CONSTRAINT `zonas_especificas_zonaTipoId_fkey` FOREIGN KEY (`zonaTipoId`) REFERENCES `zonas_tipo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zonas_especificas` ADD CONSTRAINT `zonas_especificas_edificioId_fkey` FOREIGN KEY (`edificioId`) REFERENCES `edificios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_tipoMaterialId_fkey` FOREIGN KEY (`tipoMaterialId`) REFERENCES `tipos_material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais` ADD CONSTRAINT `materiais_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais_selecionados` ADD CONSTRAINT `materiais_selecionados_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materiais_selecionados` ADD CONSTRAINT `materiais_selecionados_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_especificas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zona_tipo_materiais` ADD CONSTRAINT `zona_tipo_materiais_zonaTipoId_fkey` FOREIGN KEY (`zonaTipoId`) REFERENCES `zonas_tipo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `zona_tipo_materiais` ADD CONSTRAINT `zona_tipo_materiais_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_edificioId_fkey` FOREIGN KEY (`edificioId`) REFERENCES `edificios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_especificas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_comentarioPaiId_fkey` FOREIGN KEY (`comentarioPaiId`) REFERENCES `comentarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_aprovacoes` ADD CONSTRAINT `historico_aprovacoes_utilizadorId_fkey` FOREIGN KEY (`utilizadorId`) REFERENCES `utilizadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_aprovacoes` ADD CONSTRAINT `historico_aprovacoes_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_especificas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_decisoes` ADD CONSTRAINT `historico_decisoes_edificioId_fkey` FOREIGN KEY (`edificioId`) REFERENCES `edificios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_remetenteId_fkey` FOREIGN KEY (`remetenteId`) REFERENCES `utilizadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `utilizadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ficheiros` ADD CONSTRAINT `ficheiros_edificioId_fkey` FOREIGN KEY (`edificioId`) REFERENCES `edificios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ficheiros` ADD CONSTRAINT `ficheiros_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_especificas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ficheiros` ADD CONSTRAINT `ficheiros_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ficheiros` ADD CONSTRAINT `ficheiros_comentarioId_fkey` FOREIGN KEY (`comentarioId`) REFERENCES `comentarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `selecoes_material` ADD CONSTRAINT `selecoes_material_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zonas_especificas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `selecoes_material` ADD CONSTRAINT `selecoes_material_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `materiais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
