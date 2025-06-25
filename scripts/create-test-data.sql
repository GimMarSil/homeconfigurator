-- Script para criar dados de teste para o sistema de aprovação de materiais

-- Inserir algumas seleções de materiais de teste
INSERT INTO SelecaoMaterial (
  zonaId, materialId, quantidade, precoUnitario, precoTotal, 
  observacoes, estado, dataSelecao
) VALUES
-- Seleções para diferentes zonas e materiais
(1, 1, 25.5, 45.00, 1147.50, 'Material principal para parede', 'PENDENTE', datetime('now', '-2 days')),
(1, 2, 12.0, 35.00, 420.00, 'Material complementar', 'PENDENTE', datetime('now', '-1 day')),
(2, 3, 15.3, 28.50, 436.05, 'Revestimento de qualidade superior', 'APROVADO', datetime('now', '-5 days')),
(2, 4, 8.0, 55.00, 440.00, 'Material premium conforme especificação', 'APROVADO', datetime('now', '-4 days')),
(3, 5, 30.0, 22.00, 660.00, 'Solução económica proposta', 'REJEITADO', datetime('now', '-3 days')),
(1, 6, 18.5, 42.00, 777.00, 'Alternativa de alta qualidade', 'PENDENTE', datetime('now')),
(2, 1, 20.0, 45.00, 900.00, 'Mesmo material da zona 1', 'EM_REVISAO', datetime('now', '-1 hour'));

-- Atualizar seleções aprovadas com informações de aprovação
UPDATE SelecaoMaterial 
SET dataAprovacao = datetime('now', '-4 days'), 
    aprovadoPor = 'admin@architecture.com'
WHERE estado = 'APROVADO';

-- Atualizar seleção rejeitada com motivo e aprovador
UPDATE SelecaoMaterial 
SET dataAprovacao = datetime('now', '-3 days'),
    aprovadoPor = 'admin@architecture.com',
    motivoRejeicao = 'Material não atende aos requisitos de sustentabilidade do projeto. Favor selecionar alternativa com certificação ambiental.'
WHERE estado = 'REJEITADO';

-- Verificar dados inseridos
SELECT 
  sm.id,
  z.nome as zona_nome,
  m.nome as material_nome,
  sm.quantidade,
  sm.precoUnitario,
  sm.precoTotal,
  sm.estado,
  sm.dataSelecao,
  sm.dataAprovacao,
  sm.aprovadoPor,
  sm.motivoRejeicao
FROM SelecaoMaterial sm
JOIN Zona z ON sm.zonaId = z.id
JOIN Material m ON sm.materialId = m.id
ORDER BY sm.dataSelecao DESC; 