// URL do backend Flask
const BACKEND_URL = 'http://localhost:5001/api/receituario';

// Base de conhecimento médico para prescrições (backup local)
const MEDICAMENTOS_DB = {
    'codein': {
        nome: 'Codein',
        concentracao: '3mg/ml',
        volume: '120ml',
        prescricao: 'Codein 3mg/ml - 120ml - 1 frasco\nTomar 5ml de 8/8h\nUSO ORAL - Tratamento Contínuo'
    },
    'fosfato de codeina': {
        nome: 'Fosfato de Codeína',
        concentracao: '15mg/ml',
        volume: '500ml',
        prescricao: 'Solução Oral — 1 frasco (500ml)\nFosfato de Codeína — 15mg/ml\nCloridrato de Prometazina — 5mg/ml\nTomar 15ml de 08/08h\nUSO ORAL - Tratamento Contínuo'
    },
    'cloridrato de prometazina': {
        nome: 'Cloridrato de Prometazina',
        concentracao: '5mg/ml',
        volume: '500ml',
        prescricao: 'Solução Oral — 1 frasco (500ml)\nFosfato de Codeína — 15mg/ml\nCloridrato de Prometazina — 5mg/ml\nTomar 15ml de 08/08h\nUSO ORAL - Tratamento Contínuo'
    },
    'oxicodona': {
        nome: 'Oxicodona',
        concentracao: '10mg',
        volume: '20 comprimidos',
        prescricao: 'Oxicodona 10mg - 20 comprimidos\nTomar 1 comprimido de 12/12h\nUSO ORAL - Tratamento da Dor\nControle Especial - Receita B'
    },
    'oxycontin': {
        nome: 'OxyContin',
        concentracao: '20mg',
        volume: '14 comprimidos',
        prescricao: 'OxyContin 20mg - 14 comprimidos\nTomar 1 comprimido de 12/12h\nUSO ORAL - Tratamento da Dor Crônica\nControle Especial - Receita B'
    },
    'manipulada': {
        nome: 'Solução Oral Manipulada',
        prescricao: 'Solução Oral — 1 frasco (500ml)\nFosfato de Codeína — 15mg/ml\nCloridrato de Prometazina — 5mg/ml\nTomar 15ml de 08/08h\nUSO ORAL - Tratamento Contínuo'
    },
    'cristalia': {
        nome: 'Codein Cristalia',
        prescricao: 'Codein 3mg/ml - 120ml - 1 frasco\nTomar 5ml de 8/8h\nUSO ORAL - Tratamento Contínuo'
    }
};

// Configuração do ZapSign armazenada localmente
let zapSignConfig = {
    api_token: '',
    email: '',
    phone: '',
    password: '',
    medicoNome: '',
    medicoCrm: ''
};

// Estado da aplicação
let currentImageData = null;
let currentPdfBase64 = null;

document.addEventListener("DOMContentLoaded", function() {
    initializeElements();
    setupEventListeners();
    loadZapSignConfig();
});

function initializeElements() {
    // Elementos principais
    window.imageUpload = document.getElementById("image-upload");
    window.uploadButton = document.getElementById("upload-button");
    window.dropZone = document.getElementById("drop-zone");
    window.uploadedImage = document.getElementById("uploaded-image");
    window.uploadText = document.getElementById("upload-text");
    
    // Elementos do formulário
    window.pacienteNomeInput = document.getElementById("paciente-nome");
    window.pacienteEnderecoInput = document.getElementById("paciente-endereco");
    window.medicamentoInput = document.getElementById("medicamento");
    window.quantidadeInput = document.getElementById("quantidade");
    window.sugestaoPreenchimentoTextarea = document.getElementById("sugestao-preenchimento");
    
    // Botões
    window.preencherButton = document.getElementById("preencher-button");
    window.limparButton = document.getElementById("limpar-button");
    window.gerarReceituarioButton = document.getElementById("gerar-receituario-button");
    window.configZapSignButton = document.getElementById("config-zapsign-button");
    
    // Modal
    window.zapSignModal = document.getElementById("zapsign-modal");
    window.closeModal = document.querySelector(".close");
    window.salvarConfigButton = document.getElementById("salvar-config");
    window.cancelarConfigButton = document.getElementById("cancelar-config");
}

function setupEventListeners() {
    // Upload de arquivo
    uploadButton.addEventListener("click", () => imageUpload.click());
    imageUpload.addEventListener("change", handleFileSelect);
    
    // Drag and Drop
    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);
    dropZone.addEventListener("click", () => imageUpload.click());
    
    // Formulário
    preencherButton.addEventListener("click", gerarPrescricaoInteligente);
    limparButton.addEventListener("click", limparCampos);
    medicamentoInput.addEventListener("input", sugerirPrescricaoEmTempoReal);
    quantidadeInput.addEventListener("input", sugerirPrescricaoEmTempoReal);
    
    // Botões principais
    gerarReceituarioButton.addEventListener("click", gerarReceituario);
    configZapSignButton.addEventListener("click", abrirModalZapSign);
    
    // Modal
    closeModal.addEventListener("click", fecharModalZapSign);
    salvarConfigButton.addEventListener("click", salvarConfigZapSign);
    cancelarConfigButton.addEventListener("click", fecharModalZapSign);
    
    // Fechar modal clicando fora
    window.addEventListener("click", (event) => {
        if (event.target === zapSignModal) {
            fecharModalZapSign();
        }
    });
}

// Drag and Drop Functions
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add("dragover");
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        showMessage('Formato de arquivo não suportado. Use JPG, PNG ou PDF.', 'error');
        return;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showMessage('Arquivo muito grande. Máximo 10MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageData = e.target.result;
        
        if (file.type === 'application/pdf') {
            // Para PDFs, mostrar ícone
            uploadedImage.style.display = "none";
            uploadText.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <p>PDF carregado: ${file.name}</p>
            `;
        } else {
            // Para imagens
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = "block";
            uploadText.style.display = "none";
        }
        
        showMessage('Arquivo carregado com sucesso!', 'success');
        
        // Processar imagem automaticamente
        setTimeout(() => {
            processarImagemOCR();
        }, 1000);
    };
    
    reader.readAsDataURL(file);
}

async function processarImagemOCR() {
    if (!currentImageData) return;
    
    try {
        showMessage('Analisando documento...', 'success');
        
        const response = await fetch(`${BACKEND_URL}/processar-imagem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_data: currentImageData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const dados = result.dados_extraidos;
            
            // Preencher campos automaticamente se detectados
            if (dados.paciente_detectado) {
                pacienteNomeInput.value = dados.paciente_detectado;
            }
            if (dados.endereco_detectado) {
                pacienteEnderecoInput.value = dados.endereco_detectado;
            }
            if (dados.medicamento_detectado) {
                medicamentoInput.value = dados.medicamento_detectado;
            }
            
            showMessage(result.message, 'success');
        } else {
            showMessage('Erro ao processar imagem: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// Inteligência de Prescrição
function sugerirPrescricaoEmTempoReal() {
    const medicamento = medicamentoInput.value.toLowerCase().trim();
    const quantidade = quantidadeInput.value.toLowerCase().trim();
    
    if (medicamento.length < 3) return;
    
    // Buscar correspondências na base de conhecimento local
    for (const [key, data] of Object.entries(MEDICAMENTOS_DB)) {
        if (medicamento.includes(key) || key.includes(medicamento)) {
            let prescricao = data.prescricao;
            
            if (quantidade && quantidade.includes('120ml') && key === 'codein') {
                prescricao = MEDICAMENTOS_DB['codein'].prescricao;
            } else if (quantidade && quantidade.includes('500ml') && medicamento.includes('fosfato')) {
                prescricao = MEDICAMENTOS_DB['fosfato de codeina'].prescricao;
            }
            
            sugestaoPreenchimentoTextarea.value = prescricao;
            break;
        }
    }
}

async function gerarPrescricaoInteligente() {
    const medicamento = medicamentoInput.value.trim();
    const quantidade = quantidadeInput.value.trim();
    
    if (!medicamento) {
        showMessage('Por favor, informe o medicamento ou prescrição.', 'error');
        return;
    }
    
    preencherButton.innerHTML = '<span class="loading"></span> Gerando...';
    preencherButton.disabled = true;
    
    try {
        const response = await fetch(`${BACKEND_URL}/gerar-prescricao`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medicamento: medicamento,
                quantidade: quantidade
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            sugestaoPreenchimentoTextarea.value = result.prescricao;
            showMessage('Prescrição gerada com sucesso!', 'success');
        } else {
            showMessage('Erro ao gerar prescrição: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        // Fallback para lógica local
        gerarPrescricaoLocal(medicamento, quantidade);
    } finally {
        preencherButton.innerHTML = 'Gerar Prescrição';
        preencherButton.disabled = false;
    }
}

function gerarPrescricaoLocal(medicamento, quantidade) {
    const medicamentoLower = medicamento.toLowerCase();
    let prescricaoGerada = '';
    
    if (medicamentoLower.includes('codein') && quantidade.includes('120ml')) {
        prescricaoGerada = MEDICAMENTOS_DB['codein'].prescricao;
    } else if (medicamentoLower.includes('fosfato') || medicamentoLower.includes('prometazina') || medicamentoLower.includes('manipulada')) {
        prescricaoGerada = MEDICAMENTOS_DB['fosfato de codeina'].prescricao;
    } else if (medicamentoLower.includes('cristalia')) {
        prescricaoGerada = MEDICAMENTOS_DB['cristalia'].prescricao;
    } else {
        const medicamentoCapitalizado = medicamento.charAt(0).toUpperCase() + medicamento.slice(1);
        const quantidadeFormatada = quantidade || '1 unidade';
        prescricaoGerada = `${medicamentoCapitalizado} - ${quantidadeFormatada}\nTomar conforme orientação médica\nUSO ORAL - Tratamento Contínuo`;
    }
    
    sugestaoPreenchimentoTextarea.value = prescricaoGerada;
    showMessage('Prescrição gerada com sucesso!', 'success');
}

function limparCampos() {
    pacienteNomeInput.value = '';
    pacienteEnderecoInput.value = '';
    medicamentoInput.value = '';
    quantidadeInput.value = '';
    sugestaoPreenchimentoTextarea.value = '';
    
    // Limpar imagem
    currentImageData = null;
    currentPdfBase64 = null;
    uploadedImage.style.display = 'none';
    uploadText.style.display = 'flex';
    uploadText.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <p>Arraste a imagem aqui ou clique para selecionar</p>
        <span>Formatos aceitos: JPG, PNG, PDF</span>
    `;
    
    showMessage('Campos limpos com sucesso!', 'success');
}

// Modal ZapSign
function abrirModalZapSign() {
    zapSignModal.style.display = 'block';
}

function fecharModalZapSign() {
    zapSignModal.style.display = 'none';
}

function salvarConfigZapSign() {
    const email = document.getElementById('zapsign-email').value;
    const phone = document.getElementById('zapsign-phone').value;
    const password = document.getElementById('zapsign-password').value;
    const medicoNome = document.getElementById('medico-nome').value.toUpperCase();
    const medicoCrm = document.getElementById('medico-crm').value;
    
    if (!email || !phone || !password || !medicoNome || !medicoCrm) {
        showMessage('Por favor, preencha todos os campos da configuração.', 'error');
        return;
    }
    
    zapSignConfig = {
        api_token: '', // Será preenchido quando implementarmos autenticação automática
        email,
        phone,
        password,
        medicoNome,
        medicoCrm
    };
    
    // Salvar no localStorage
    localStorage.setItem('zapSignConfig', JSON.stringify(zapSignConfig));
    
    fecharModalZapSign();
    showMessage('Configuração do ZapSign salva com sucesso!', 'success');
}

function loadZapSignConfig() {
    const saved = localStorage.getItem('zapSignConfig');
    if (saved) {
        zapSignConfig = JSON.parse(saved);
        
        // Preencher campos do modal
        document.getElementById('zapsign-email').value = zapSignConfig.email || '';
        document.getElementById('zapsign-phone').value = zapSignConfig.phone || '';
        document.getElementById('zapsign-password').value = zapSignConfig.password || '';
        document.getElementById('medico-nome').value = zapSignConfig.medicoNome || '';
        document.getElementById('medico-crm').value = zapSignConfig.medicoCrm || '';
    }
}

// Gerar Receituário
async function gerarReceituario() {
    const pacienteNome = pacienteNomeInput.value.trim();
    const pacienteEndereco = pacienteEnderecoInput.value.trim();
    const prescricao = sugestaoPreenchimentoTextarea.value.trim();
    
    if (!pacienteNome || !pacienteEndereco || !prescricao) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    gerarReceituarioButton.innerHTML = '<span class="loading"></span> Gerando Receituário...';
    gerarReceituarioButton.disabled = true;
    
    try {
        // Gerar PDF
        const pdfResponse = await fetch(`${BACKEND_URL}/gerar-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paciente_nome: pacienteNome,
                paciente_endereco: pacienteEndereco,
                prescricao: prescricao,
                medico_nome: zapSignConfig.medicoNome || 'MARKUS VINICIUS BRAGA',
                medico_crm: zapSignConfig.medicoCrm || '128808-SP'
            })
        });
        
        const pdfResult = await pdfResponse.json();
        
        if (pdfResult.success) {
            currentPdfBase64 = pdfResult.pdf_base64;
            
            // Se ZapSign configurado, enviar para assinatura
            if (zapSignConfig.email && zapSignConfig.api_token) {
                await enviarParaZapSign(pdfResult.filename);
            } else {
                // Download direto do PDF
                downloadPDF(pdfResult.pdf_base64, pdfResult.filename);
                showMessage('Receituário gerado! Configure o ZapSign para assinatura automática.', 'success');
            }
        } else {
            showMessage('Erro ao gerar receituário: ' + pdfResult.error, 'error');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    } finally {
        gerarReceituarioButton.innerHTML = 'Gerar Receituário';
        gerarReceituarioButton.disabled = false;
    }
}

async function enviarParaZapSign(filename) {
    try {
        showMessage('Enviando para ZapSign...', 'success');
        
        const response = await fetch(`${BACKEND_URL}/enviar-zapsign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pdf_base64: currentPdfBase64,
                documento_nome: filename,
                zapsign_config: zapSignConfig
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`Receituário enviado para assinatura! Token: ${result.zapsign_token}`, 'success');
            
            // Abrir URL de assinatura se disponível
            if (result.sign_url) {
                window.open(result.sign_url, '_blank');
            }
        } else {
            showMessage('Erro ao enviar para ZapSign: ' + result.error, 'error');
            // Fallback: download direto
            downloadPDF(currentPdfBase64, filename);
        }
    } catch (error) {
        console.error('Erro ao enviar para ZapSign:', error);
        showMessage('Erro ao enviar para ZapSign. Fazendo download direto.', 'error');
        downloadPDF(currentPdfBase64, filename);
    }
}

function downloadPDF(base64Data, filename) {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,' + base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility Functions
function showMessage(text, type) {
    // Remove mensagens existentes
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Inserir após o título
    const h2 = document.querySelector('h2');
    h2.parentNode.insertBefore(message, h2.nextSibling);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Transformar nome do médico em maiúsculas automaticamente
document.addEventListener('input', function(e) {
    if (e.target.id === 'medico-nome') {
        e.target.value = e.target.value.toUpperCase();
    }
});

