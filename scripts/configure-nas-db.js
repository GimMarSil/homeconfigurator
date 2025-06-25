#!/usr/bin/env node

/**
 * Script para configurar a base de dados MariaDB na NAS
 * Executa: node scripts/configure-nas-db.js
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 Configurando base de dados NAS - Home Configurator');
console.log('═'.repeat(60));

// Configuração da NAS
const nasConfig = {
  host: '192.168.1.116',
  port: 3306,
  database: 'homeconfigurator',
  username: 'hc_admin',
  password: 'MAWmqrcdr1.1'
};

// String de conexão MariaDB
const databaseUrl = `mysql://${nasConfig.username}:${nasConfig.password}@${nasConfig.host}:${nasConfig.port}/${nasConfig.database}`;

console.log('\n📋 Passos para configurar a base de dados na NAS:');
console.log('─'.repeat(60));

console.log('\n1️⃣ ALTERAR O FICHEIRO .env.local');
console.log('   Substitua a linha DATABASE_URL por:');
console.log(`   DATABASE_URL="${databaseUrl}"`);

console.log('\n2️⃣ CONFIGURAR O UTILIZADOR NA NAS (Via SSH)');
console.log('   Ligue-se à NAS via SSH e execute:');
console.log('   /volume1/@appstore/MariaDB10/usr/local/mariadb10/bin/mysql -u root -p -S /run/mysqld/mysqld10.sock');
console.log('');
console.log('   Depois execute estes comandos SQL:');
console.log(`   ALTER USER '${nasConfig.username}'@'%' IDENTIFIED WITH mysql_native_password BY '${nasConfig.password}';`);
console.log('   FLUSH PRIVILEGES;');
console.log('   EXIT;');

console.log('\n3️⃣ CRIAR A BASE DE DADOS (se ainda não existir)');
console.log('   Na consola MySQL da NAS, execute:');
console.log(`   CREATE DATABASE IF NOT EXISTS ${nasConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
console.log(`   GRANT ALL PRIVILEGES ON ${nasConfig.database}.* TO '${nasConfig.username}'@'%';`);
console.log('   FLUSH PRIVILEGES;');

console.log('\n4️⃣ INSTALAR DEPENDÊNCIAS MYSQL');
console.log('   Execute: npm install mysql2');

console.log('\n5️⃣ EXECUTAR MIGRAÇÕES PRISMA');
console.log('   Execute: npx prisma db push');
console.log('   Execute: npx prisma generate');

console.log('\n6️⃣ VERIFICAR CONEXÃO');
console.log('   Execute: node scripts/test-db-connection.js');

console.log('\n📄 Criando ficheiro de exemplo .env.local...');

// Conteúdo do .env.local
const envContent = `# Configuração da Base de Dados - NAS MariaDB
DATABASE_URL="${databaseUrl}"

# Configurações NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="chave-secreta-desenvolvimento-123-muito-longa-para-ser-segura"

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=public/uploads

# Ambiente de desenvolvimento
NODE_ENV=development
DEBUG=true
`;

try {
  fs.writeFileSync('.env.local.example', envContent);
  console.log('✅ Ficheiro .env.local.example criado com sucesso!');
  console.log('   Copie o conteúdo para .env.local');
} catch (error) {
  console.log('❌ Erro ao criar ficheiro:', error.message);
  console.log('\n📋 Conteúdo para .env.local:');
  console.log('─'.repeat(40));
  console.log(envContent);
}

console.log('\n🔗 String de conexão completa:');
console.log(databaseUrl);

console.log('\n⚠️  IMPORTANTE:');
console.log('   - Certifique-se que a NAS está acessível na rede');
console.log('   - Verifique se a porta 3306 está aberta na NAS');
console.log('   - Teste a conexão antes de executar as migrações');

console.log('\n🎯 Próximos passos após configuração:');
console.log('   1. Copiar dados da SQLite (se necessário)');
console.log('   2. Executar seed da base de dados');
console.log('   3. Testar a aplicação');

console.log('\n' + '═'.repeat(60));
console.log('🏁 Configuração concluída! Siga os passos acima.'); 