// URL do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwedYP6Xg0cFee3CgOfr59bYPi5HT4LWYqoro7WRjtjGbukv6k0Pz3XRhR8ur1ktBwS/exec';

// Verificar autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se está autenticado
    if (localStorage.getItem('authenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Adicionar evento ao botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authenticated');
            window.location.href = 'login.html';
        });
    }

    // Carregar dados
    carregarDados();
});

// Função para carregar dados da planilha
function carregarDados() {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="loading">Carregando dados...</td></tr>';

    fetch(`${SCRIPT_URL}?action=get`)
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = '';
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum dado encontrado.</td></tr>';
                return;
            }

            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.Código || ''}</td>
                    <td>${row.Cliente || ''}</td>
                    <td>${row.Produto || ''}</td>
                    <td>${row.Quantidade || ''}</td>
                    <td>${row.Data || ''}</td>
                    <td class="actions">
                        <button class="url-btn" data-code="${row.Código}">🔗 URL</button>
                        <button class="edit-btn" data-index="${index}">✏️ Editar</button>
                        <button class="delete-btn" data-index="${index}">❌ Excluir</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Adicionar eventos aos botões
            adicionarEventos(data);
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            tableBody.innerHTML = '<tr><td colspan="6" class="error">Erro ao carregar dados. Tente novamente mais tarde.</td></tr>';
        });
}

// Função para adicionar eventos aos botões
function adicionarEventos(data) {
    // Botões de editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const row = data[index];
            
            document.getElementById('edit-index').value = index;
            document.getElementById('edit-codigo').value = row.Código || '';
            document.getElementById('edit-cliente').value = row.Cliente || '';
            document.getElementById('edit-produto').value = row.Produto || '';
            document.getElementById('edit-quantidade').value = row.Quantidade || '';
            document.getElementById('edit-data').value = row.Data || '';
            
            document.getElementById('edit-modal').style.display = 'block';
        });
    });

    // Botões de excluir
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const row = data[index];
            
            document.getElementById('delete-index').value = index;
            document.getElementById('delete-message').textContent = `Tem certeza que deseja excluir o produto "${row.Produto}" do cliente "${row.Cliente}"?`;
            
            document.getElementById('delete-modal').style.display = 'block';
        });
    });

    // Botões de URL
    document.querySelectorAll('.url-btn').forEach(button => {
        button.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const url = `https://fuckingpack.xyz/?code=${code}`;
            
            // Tentar copiar para a área de transferência
            navigator.clipboard.writeText(url)
                .then(() => {
                    showNotification('URL copiada para a área de transferência!');
                })
                .catch(() => {
                    // Se falhar, mostrar modal com a URL
                    document.getElementById('url-display').value = url;
                    document.getElementById('url-modal').style.display = 'block';
                });
        });
    });
}

// Função para fechar modais
function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Função para salvar edição
function salvarEdicao() {
    const index = document.getElementById('edit-index').value;
    const codigo = document.getElementById('edit-codigo').value;
    const cliente = document.getElementById('edit-cliente').value;
    const produto = document.getElementById('edit-produto').value;
    const quantidade = document.getElementById('edit-quantidade').value;
    const data = document.getElementById('edit-data').value;
    
    // Validar campos obrigatórios
    if (!codigo || !cliente || !produto) {
        alert('Por favor, preencha os campos obrigatórios: Código, Cliente e Produto.');
        return;
    }
    
    const rowData = {
        Código: codigo,
        Cliente: cliente,
        Produto: produto,
        Quantidade: quantidade,
        Data: data
    };
    
    // Enviar para o Google Apps Script
    fetch(`${SCRIPT_URL}?action=edit&rowIndex=${index}`, {
        method: 'POST',
        body: new URLSearchParams({
            data: JSON.stringify(rowData)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fecharModal('edit-modal');
            showNotification('Produto atualizado com sucesso!');
            carregarDados();
        } else {
            alert(`Erro ao atualizar produto: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar produto. Tente novamente mais tarde.');
    });
}

// Função para confirmar exclusão
function confirmarExclusao() {
    const index = document.getElementById('delete-index').value;
    
    // Enviar para o Google Apps Script
    fetch(`${SCRIPT_URL}?action=delete&rowIndex=${index}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            fecharModal('delete-modal');
            showNotification('Produto excluído com sucesso!');
            carregarDados();
        } else {
            alert(`Erro ao excluir produto: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente mais tarde.');
    });
}

// Função para adicionar novo produto
function adicionarProduto() {
    const codigo = document.getElementById('add-codigo').value;
    const cliente = document.getElementById('add-cliente').value;
    const produto = document.getElementById('add-produto').value;
    const quantidade = document.getElementById('add-quantidade').value;
    const data = document.getElementById('add-data').value;
    
    // Validar campos obrigatórios
    if (!codigo || !cliente || !produto) {
        alert('Por favor, preencha os campos obrigatórios: Código, Cliente e Produto.');
        return;
    }
    
    const rowData = {
        Código: codigo,
        Cliente: cliente,
        Produto: produto,
        Quantidade: quantidade,
        Data: data
    };
    
    // Enviar para o Google Apps Script
    fetch(`${SCRIPT_URL}?action=add`, {
        method: 'POST',
        body: new URLSearchParams({
            data: JSON.stringify(rowData)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Limpar formulário
            document.getElementById('add-form').reset();
            
            showNotification('Produto adicionado com sucesso!');
            carregarDados();
        } else {
            alert(`Erro ao adicionar produto: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto. Tente novamente mais tarde.');
    });
}

// Função para mostrar notificação
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

