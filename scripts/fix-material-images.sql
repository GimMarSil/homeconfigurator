-- Script para corrigir os registos de imagens dos materiais

-- Adicionar imagens para material 1
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_1_1_exemplo.jpg', 'material_1_1_exemplo.jpg', '/uploads/materiais/material_1_1_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 1, NOW(), NOW()),
('material_1_2_exemplo.jpg', 'material_1_2_exemplo.jpg', '/uploads/materiais/material_1_2_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 1, NOW(), NOW()),
('material_1_3_exemplo.jpg', 'material_1_3_exemplo.jpg', '/uploads/materiais/material_1_3_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 1, NOW(), NOW());

-- Adicionar imagens para material 2
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_2_1_exemplo.jpg', 'material_2_1_exemplo.jpg', '/uploads/materiais/material_2_1_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 2, NOW(), NOW()),
('material_2_2_exemplo.jpg', 'material_2_2_exemplo.jpg', '/uploads/materiais/material_2_2_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 2, NOW(), NOW()),
('material_2_3_exemplo.jpg', 'material_2_3_exemplo.jpg', '/uploads/materiais/material_2_3_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 2, NOW(), NOW());

-- Adicionar imagens para material 3
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_3_1_exemplo.jpg', 'material_3_1_exemplo.jpg', '/uploads/materiais/material_3_1_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 3, NOW(), NOW()),
('material_3_2_exemplo.jpg', 'material_3_2_exemplo.jpg', '/uploads/materiais/material_3_2_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 3, NOW(), NOW()),
('material_3_3_exemplo.jpg', 'material_3_3_exemplo.jpg', '/uploads/materiais/material_3_3_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 3, NOW(), NOW());

-- Adicionar imagens para material 4
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_4_1_exemplo.jpg', 'material_4_1_exemplo.jpg', '/uploads/materiais/material_4_1_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 4, NOW(), NOW()),
('material_4_2_exemplo.jpg', 'material_4_2_exemplo.jpg', '/uploads/materiais/material_4_2_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 4, NOW(), NOW()),
('material_4_3_exemplo.jpg', 'material_4_3_exemplo.jpg', '/uploads/materiais/material_4_3_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 4, NOW(), NOW());

-- Adicionar imagens para material 5
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_5_1_exemplo.jpg', 'material_5_1_exemplo.jpg', '/uploads/materiais/material_5_1_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 5, NOW(), NOW()),
('material_5_2_exemplo.jpg', 'material_5_2_exemplo.jpg', '/uploads/materiais/material_5_2_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 5, NOW(), NOW()),
('material_5_3_exemplo.jpg', 'material_5_3_exemplo.jpg', '/uploads/materiais/material_5_3_exemplo.jpg', 1064, 'image/jpeg', 'IMAGEM_MATERIAL', 5, NOW(), NOW());

-- Adicionar imagens para material 6 (incluindo as reais que foram carregadas)
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_6_1750785928411_au74lnd5mi.jpg', 'material_6_1750785928411_au74lnd5mi.jpg', '/uploads/materiais/material_6_1750785928411_au74lnd5mi.jpg', 407108, 'image/jpeg', 'IMAGEM_MATERIAL', 6, NOW(), NOW());

-- Adicionar imagens para material 12 (incluindo as reais que foram carregadas)
INSERT IGNORE INTO Ficheiro (nomeOriginal, nomeArquivo, caminho, tamanho, tipoMime, categoria, materialId, criadoEm, atualizadoEm)
VALUES 
('material_12_1750838627269_06zirbd1p3yi.jpg', 'material_12_1750838627269_06zirbd1p3yi.jpg', '/uploads/materiais/material_12_1750838627269_06zirbd1p3yi.jpg', 80334, 'image/jpeg', 'IMAGEM_MATERIAL', 12, NOW(), NOW()),
('material_12_1750838710482_c6dz8hy0oig.jpg', 'material_12_1750838710482_c6dz8hy0oig.jpg', '/uploads/materiais/material_12_1750838710482_c6dz8hy0oig.jpg', 386685, 'image/jpeg', 'IMAGEM_MATERIAL', 12, NOW(), NOW());

-- Verificar os resultados
SELECT 
    m.id,
    m.nome,
    COUNT(f.id) as total_ficheiros,
    COUNT(CASE WHEN f.categoria = 'IMAGEM_MATERIAL' THEN 1 END) as total_imagens
FROM Material m
LEFT JOIN Ficheiro f ON m.id = f.materialId
GROUP BY m.id, m.nome
ORDER BY m.id
LIMIT 15; 