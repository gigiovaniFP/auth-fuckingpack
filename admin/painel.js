// URL do Google Apps Script publicado como aplicativo da web
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKfUv7zGez-2FYGDDP1bYFL9a3NckONq3yWkmnCiep4kN74JphbE4DbwuAhM9QNIs8/exec';

// Função para formatar a data
function formatarData(dataString) {
    if (!dataString) return '-';
    
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

// Função para carregar os dados da planilha
async function carregarDados() {
    try {
        // Exibir mensagem de carregamento
        document.getElementById('resultado').innerHTML = 'Carregando dados...';
        
        // Fazer a requisição para o Google Apps Script
        const response = await fetch(`${SCRIPT_URL}?painel=todos`);
        const data = await response.json();
        
        // Exibir os dados na tabela
        exibirTabela(data);
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('resultado').innerHTML = 'Erro ao carregar dados.';
    }
}

// Função para exibir os dados na tabela
function exibirTabela(data) {
    // Verificar se há dados
    if (!data || data.length === 0) {
        document.getElementById('resultado').innerHTML = 'Nenhum dado encontrado.';
        return;
    }
    
    // Criar a tabela
    let html = '<table>';
    
    // Cabeçalho da tabela
    html += '<tr>';
    Object.keys(data[0]).forEach(coluna => {
        html += `<th>${coluna}</th>`;
    });
    html += '</tr>';
    
    // Linhas da tabela
    data.forEach(linha => {
        html += '<tr>';
        Object.entries(linha).forEach(([chave, valor]) => {
            // Formatar a data se for a coluna "Data"
            if (chave === 'Data') {
                html += `<td>${formatarData(valor)}</td>`;
            } else {
                html += `<td>${valor || '-'}</td>`;
            }
        });
        html += '</tr>';
    });
    
    html += '</table>';
    
    // Exibir a tabela
    document.getElementById('resultado').innerHTML = html;
}

// Carregar os dados quando a página for carregada
window.onload = carregarDados;

