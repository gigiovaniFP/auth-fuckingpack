// URL do Google Apps Script publicado como aplicativo da web
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8TfojeOWC8aVXJAuhMOLRHhXuuxl0arZDwK8GOAGwPeW45WWJI-grUBSg-9o3Vx-_/exec';

// Função para obter parâmetros da URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        code: params.get('code')
    };
}

// Função para formatar a data
function formatarData(dataString) {
    if (!dataString) return 'Autenticado agora';
    
    const data = new Date(dataString);
    
    // Verificar se a data é válida
    if (isNaN(data.getTime())) return dataString;
    
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    const hora = data.getHours().toString().padStart(2, '0');
    const minuto = data.getMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Função para verificar o código
async function verificarCodigo(codigo) {
    try {
        // Exibir mensagem de carregamento
        document.getElementById('resultado').innerHTML = 'Autenticando...';
        
        // Fazer a requisição para o Google Apps Script
        const response = await fetch(`${SCRIPT_URL}?code=${codigo}`);
        const data = await response.json();
        
        // Verificar se houve erro
        if (data.error) {
            document.getElementById('resultado').innerHTML = `❌ ${data.error}`;
            return;
        }
        
        // Verificar se o código é válido
        if (!data['Cliente']) {
            document.getElementById('resultado').innerHTML = '❌ Código inválido.';
            return;
        }
        
        // Exibir os dados do produto
        document.getElementById('resultado').innerHTML = `
            <strong>✅ Código válido!</strong><br><br>
            <b>Cliente:</b> ${data['Cliente']}<br>
            <b>Produto:</b> ${data['Produto']}<br>
            <b>Quantidade:</b> ${data['Quantidade']}<br>
            <b>Data:</b> ${formatarData(data['Data'])}<br>
        `;
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('resultado').innerHTML = '❌ Erro ao verificar o código.';
    }
}

// Executar quando a página carregar
window.onload = function() {
    const { code } = getUrlParams();
    
    if (!code) {
        document.getElementById('resultado').innerHTML = 'Nenhum código fornecido.<br>Use o link ou QR Code para autenticar o produto.';
        return;
    }
    
    verificarCodigo(code);
};

