#!/usr/bin/env node

/**
 * Script para testar a conexão à base de dados MariaDB na NAS
 * Executa: node scripts/test-db-connection.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

console.log('🔗 Testando conexão à base de dados NAS...');
console.log('═'.repeat(50));

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL não encontrada no .env.local');
    process.exit(1);
  }

  console.log(`📡 URL de conexão: ${databaseUrl.replace(/:[^:]*@/, ':***@')}`);

  try {
    // Parse da URL de conexão
    const url = new URL(databaseUrl);
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove a barra inicial
      connectTimeout: 10000, // 10 segundos
      acquireTimeout: 10000,
      ssl: false // Para conexões locais
    };

    console.log('\n🔧 Configuração da conexão:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Porto: ${config.port}`);
    console.log(`   Utilizador: ${config.user}`);
    console.log(`   Base de dados: ${config.database}`);

    console.log('\n⏳ Tentando conectar...');
    
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexão estabelecida com sucesso!');

    // Testar uma query simples
    console.log('\n🧪 Testando query básica...');
    const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as server_time');
    
    console.log('✅ Query executada com sucesso!');
    console.log(`   Versão MariaDB: ${rows[0].version}`);
    console.log(`   Hora do servidor: ${rows[0].server_time}`);

    // Verificar se a base de dados existe
    console.log('\n🗃️  Verificando base de dados...');
    const [dbRows] = await connection.execute(`SHOW DATABASES LIKE '${config.database}'`);
    
    if (dbRows.length > 0) {
      console.log(`✅ Base de dados '${config.database}' existe!`);
      
      // Verificar tabelas
      const [tableRows] = await connection.execute(`SHOW TABLES FROM ${config.database}`);
      console.log(`   Tabelas existentes: ${tableRows.length}`);
      
      if (tableRows.length > 0) {
        console.log('   📋 Tabelas encontradas:');
        tableRows.forEach((table, index) => {
          const tableName = table[`Tables_in_${config.database}`];
          console.log(`      ${index + 1}. ${tableName}`);
        });
      } else {
        console.log('   ⚠️  Nenhuma tabela encontrada (execute as migrações Prisma)');
      }
    } else {
      console.log(`❌ Base de dados '${config.database}' não existe!`);
      console.log('   Execute o comando SQL para criar a base de dados.');
    }

    await connection.end();
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.log('\n❌ Erro na conexão:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Possíveis soluções:');
      console.log('   1. Verificar se MariaDB está a correr na NAS');
      console.log('   2. Verificar se a porta 3306 está aberta');
      console.log('   3. Verificar conectividade de rede (ping 192.168.1.116)');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Possíveis soluções:');
      console.log('   1. Verificar utilizador e palavra-passe');
      console.log('   2. Configurar o plugin de autenticação do utilizador');
      console.log('   3. Verificar permissões do utilizador');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Solução:');
      console.log('   Criar a base de dados com o comando SQL fornecido');
    }
    
    process.exit(1);
  }
}

// Verificar se mysql2 está instalado
try {
  require('mysql2');
} catch (error) {
  console.log('❌ Dependência mysql2 não encontrada!');
  console.log('   Execute: npm install mysql2');
  process.exit(1);
}

testConnection(); 