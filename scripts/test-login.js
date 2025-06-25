async function testLogin() {
  try {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🔍 Testando login do Super Admin...');
    console.log(`📡 URL base: ${baseUrl}`);
    
    // Dados do super admin
    const loginData = {
      email: 'admin@homeconfigurator.pt',
      password: 'admin123'
    };
    
    console.log('\n📤 Enviando credenciais:', {
      email: loginData.email,
      password: '***'
    });
    
    // Teste do endpoint de login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`\n📥 Resposta do login: ${loginResponse.status} ${loginResponse.statusText}`);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.error('❌ Erro no login:', errorData);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Dados do utilizador:', {
      id: loginResult.user?.id,
      email: loginResult.user?.email,
      role: loginResult.user?.role
    });
    
    // Simular token para teste de APIs (na aplicação real, é criado no cliente)
    const token = encodeURIComponent(JSON.stringify(loginResult.user));
    console.log('🔑 Token simulado criado');
    
    // Testar API com token simulado
    console.log('\n🔗 Testando acesso à API com token...');
    
    const apiResponse = await fetch(`${baseUrl}/api/clientes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📥 Resposta da API clientes: ${apiResponse.status} ${apiResponse.statusText}`);
    
    if (apiResponse.ok) {
      const clientes = await apiResponse.json();
      console.log('✅ API funcionando! Clientes encontrados:', clientes.length);
    } else {
      const errorData = await apiResponse.text();
      console.error('❌ Erro na API:', errorData);
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

if (require.main === module) {
  testLogin();
}

module.exports = { testLogin }; 