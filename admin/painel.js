// URL do Google Apps Script publicado como aplicativo da web
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxn3CRpVo_tN_H9miwjkDIzAjUNA7XXySmaNdXOrASR4jmdQ0CFVQtNZ4s1uCA54Qy2/exec';

// URL base do site para autenticação
const SITE_URL = 'https://fuckingpack.xyz/?code=';

// Variáveis globais
let dadosAtuais = [];
let codigoParaExcluir = null;

// Verificar autenticação ao carregar a página
window.onload = function() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        // Redirecionar para a página de login se não houver token
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar os dados com o token de autenticação
    carregarDados();
};

// Função para fazer logout
function logout() {
    // Remover o token de autenticação
    localStorage.removeItem('authToken');
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
}

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

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo) {
    const notificacao = document.getElementById('notificacao');
    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo}`;
    notificacao.style.display = 'block';
    
    // Esconder a notificação após 5 segundos
    setTimeout(() => {
        notificacao.style.display = 'none';
    }, 5000);
}

// Função para carregar os dados da planilha
async function carregarDados() {
    try {
        // Obter o token de autenticação
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            window.location.href = 'login.html';
            return;
        }
        
        // Exibir mensagem de carregamento
        document.getElementById('resultado').innerHTML = 'Carregando dados...';
        
        // Fazer a requisição para o Google Apps Script com o token de autenticação
        const response = await fetch(`${SCRIPT_URL}?painel=todos&auth=${authToken}`);
        const data = await response.json();
        
        // Verificar se a autenticação falhou
        if (data.requireAuth) {
            // Token inválido, redirecionar para a página de login
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }
        
        // Armazenar os dados para uso posterior
        dadosAtuais = data;
        
        // Exibir os dados na tabela
        exibirTabela(data);
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('resultado').innerHTML = 'Erro ao carregar dados.';
        mostrarNotificacao('Erro ao carregar dados.', 'error');
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
    html += '<th>Ações</th>'; // Coluna adicional para ações
    html += '</tr>';
    
    // Linhas da tabela
    data.forEach(linha => {
        html += '<tr>';
        Object.entries(linha).forEach(([chave, valor]) => {
            // Formatar a data se for a coluna "Data"
            if (chave === 'Data') {
                html += `<td>${formatarData(valor)}</td>`;
            } else {
                html += `<td>${valor || '-'}`;
            }
        });
        
        // Adicionar botões de ação
        html += `<td class="actions-column">
            <button onclick="gerarURL('${linha.Código}')" class="btn-url" title="Gerar URL para o cliente">🔗 URL</button>
            <button onclick="mostrarFormularioEdicao('${linha.Código}')" class="btn-edit" title="Editar produto">✏️ Editar</button>
            <button onclick="iniciarExclusao('${linha.Código}')" class="btn-delete" title="Excluir produto">🗑️ Excluir</button>
        </td>`;
        
        html += '</tr>';
    });
    
    html += '</table>';
    
    // Exibir a tabela
    document.getElementById('resultado').innerHTML = html;
}

// Função para gerar URL de autenticação
function gerarURL(codigo) {
    const url = SITE_URL + codigo;
    
    // Copiar a URL para a área de transferência
    navigator.clipboard.writeText(url)
        .then(() => {
            mostrarNotificacao(`URL copiada para a área de transferência: ${url}`, 'success');
        })
        .catch(err => {
            console.error('Erro ao copiar URL: ', err);
            // Mostrar um modal com a URL se não conseguir copiar
            mostrarModalURL(url);
        });
}

// Função para mostrar modal com a URL
function mostrarModalURL(url) {
    // Criar um modal temporário se não existir
    let modal = document.getElementById('modal-url');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-url';
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const title = document.createElement('h3');
        title.textContent = 'URL de Autenticação';
        
        const urlDisplay = document.createElement('div');
        urlDisplay.className = 'url-display';
        
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.id = 'url-input';
        urlInput.readOnly = true;
        urlInput.value = url;
        
        const actions = document.createElement('div');
        actions.className = 'form-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-primary';
        copyBtn.textContent = 'Copiar';
        copyBtn.onclick = function() {
            document.getElementById('url-input').select();
            document.execCommand('copy');
            mostrarNotificacao('URL copiada para a área de transferência!', 'success');
        };
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-cancel';
        closeBtn.textContent = 'Fechar';
        closeBtn.onclick = function() {
            document.getElementById('modal-url').style.display = 'none';
        };
        
        actions.appendChild(copyBtn);
        actions.appendChild(closeBtn);
        
        urlDisplay.appendChild(urlInput);
        
        modalContent.appendChild(title);
        modalContent.appendChild(urlDisplay);
        
        modalContent.appendChild(actions);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    } else {
        document.getElementById('url-input').value = url;
    }
    
    // Mostrar o modal
    modal.style.display = 'flex';
}

// Função para mostrar o formulário de adição
function mostrarFormularioAdicao() {
    document.getElementById('form-adicao').style.display = 'block';
    document.getElementById('form-edicao').style.display = 'none';
    document.getElementById('adicionar-form').reset();
}

// Função para cancelar a adição
function cancelarAdicao() {
    document.getElementById('form-adicao').style.display = 'none';
}

// Função para adicionar um novo produto
async function adicionarProduto(event) {
    event.preventDefault();
    
    // Obter o token de autenticação
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    // Obter os dados do formulário
    const codigo = document.getElementById('add-codigo').value;
    const cliente = document.getElementById('add-cliente').value;
    const produto = document.getElementById('add-produto').value;
    const quantidade = document.getElementById('add-quantidade').value;
    
    // Verificar se o código já existe
    if (dadosAtuais.some(item => item.Código === codigo)) {
        mostrarNotificacao('Erro: Código já existe.', 'error');
        return;
    }
    
    try {
        // Preparar os dados para envio
        const dados = {
            action: 'add',
            auth: authToken,
            data: {
                'Código': codigo,
                'Cliente': cliente,
                'Produto': produto,
                'Quantidade': quantidade
            }
        };
        
        // Enviar os dados para o Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        // Verificar se a autenticação falhou
        if (result.requireAuth) {
            // Token inválido, redirecionar para a página de login
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }
        
        if (result.success) {
            // Esconder o formulário
            document.getElementById('form-adicao').style.display = 'none';
            
            // Recarregar os dados
            await carregarDados();
            
            // Mostrar notificação de sucesso
            mostrarNotificacao('Produto adicionado com sucesso!', 'success');
        } else {
            mostrarNotificacao(`Erro: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao adicionar produto.', 'error');
    }
}

// Função para mostrar o formulário de edição
function mostrarFormularioEdicao(codigo) {
    // Encontrar o produto pelo código
    const produto = dadosAtuais.find(item => item.Código === codigo);
    
    if (!produto) {
        mostrarNotificacao('Produto não encontrado.', 'error');
        return;
    }
    
    // Preencher o formulário com os dados do produto
    document.getElementById('edit-codigo-original').value = codigo;
    document.getElementById('edit-codigo').value = produto.Código;
    document.getElementById('edit-cliente').value = produto.Cliente;
    document.getElementById('edit-produto').value = produto.Produto;
    document.getElementById('edit-quantidade').value = produto.Quantidade;
    document.getElementById('edit-data').value = formatarData(produto.Data);
    
    // Mostrar o formulário
    document.getElementById('form-edicao').style.display = 'block';
    document.getElementById('form-adicao').style.display = 'none';
}

// Função para cancelar a edição
function cancelarEdicao() {
    document.getElementById('form-edicao').style.display = 'none';
}

// Função para editar um produto
async function editarProduto(event) {
    event.preventDefault();
    
    // Obter o token de autenticação
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    // Obter os dados do formulário
    const codigoOriginal = document.getElementById('edit-codigo-original').value;
    const codigo = document.getElementById('edit-codigo').value;
    const cliente = document.getElementById('edit-cliente').value;
    const produto = document.getElementById('edit-produto').value;
    const quantidade = document.getElementById('edit-quantidade').value;
    
    // Verificar se o novo código já existe (se for diferente do original)
    if (codigo !== codigoOriginal && dadosAtuais.some(item => item.Código === codigo)) {
        mostrarNotificacao('Erro: Código já existe.', 'error');
        return;
    }
    
    try {
        // Preparar os dados para envio
        const dados = {
            action: 'edit',
            auth: authToken,
            code: codigoOriginal,
            data: {
                'Código': codigo,
                'Cliente': cliente,
                'Produto': produto,
                'Quantidade': quantidade
            }
        };
        
        // Enviar os dados para o Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        // Verificar se a autenticação falhou
        if (result.requireAuth) {
            // Token inválido, redirecionar para a página de login
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }
        
        if (result.success) {
            // Esconder o formulário
            document.getElementById('form-edicao').style.display = 'none';
            
            // Recarregar os dados
            await carregarDados();
            
            // Mostrar notificação de sucesso
            mostrarNotificacao('Produto atualizado com sucesso!', 'success');
        } else {
            mostrarNotificacao(`Erro: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao atualizar produto.', 'error');
    }
}

// Função para iniciar o processo de exclusão
function iniciarExclusao(codigo) {
    // Armazenar o código para exclusão
    codigoParaExcluir = codigo;
    
    // Mostrar o código no modal
    document.getElementById('codigo-exclusao').textContent = codigo;
    
    // Mostrar o modal de confirmação
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

// Função para cancelar a exclusão
function cancelarExclusao() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    codigoParaExcluir = null;
}

// Função para confirmar a exclusão
async function confirmarExclusao() {
    if (!codigoParaExcluir) {
        cancelarExclusao();
        return;
    }
    
    // Obter o token de autenticação
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Preparar os dados para envio
        const dados = {
            action: 'delete',
            auth: authToken,
            code: codigoParaExcluir
        };
        
        // Enviar os dados para o Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        // Esconder o modal
        document.getElementById('modal-confirmacao').style.display = 'none';
        
        // Verificar se a autenticação falhou
        if (result.requireAuth) {
            // Token inválido, redirecionar para a página de login
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
            return;
        }
        
        if (result.success) {
            // Recarregar os dados
            await carregarDados();
            
            // Mostrar notificação de sucesso
            mostrarNotificacao('Produto excluído com sucesso!', 'success');
        } else {
            mostrarNotificacao(`Erro: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarNotificacao('Erro ao excluir produto.', 'error');
    }
    
    // Limpar o código para exclusão
    codigoParaExcluir = null;
}

