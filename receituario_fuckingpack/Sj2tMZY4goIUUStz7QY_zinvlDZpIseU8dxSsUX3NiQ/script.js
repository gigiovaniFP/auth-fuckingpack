document.addEventListener("DOMContentLoaded", function() {
    const imageUpload = document.getElementById("image-upload");
    const uploadButton = document.getElementById("upload-button");
    const uploadedImage = document.getElementById("uploaded-image");
    const uploadText = document.getElementById("upload-text");
    const preencherButton = document.getElementById("preencher-button");
    const gerarReceituarioButton = document.getElementById("gerar-receituario-button");
    const pacienteNomeInput = document.getElementById("paciente-nome");
    const pacienteEnderecoInput = document.getElementById("paciente-endereco");
    const medicamentoInput = document.getElementById("medicamento");
    const quantidadeInput = document.getElementById("quantidade");
    const sugestaoPreenchimentoTextarea = document.getElementById("sugestao-preenchimento");

    // Evento para o botão de upload
    uploadButton.addEventListener("click", function() {
        imageUpload.click();
    });

    // Evento para quando a imagem é selecionada
    imageUpload.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = "block";
                uploadText.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });

    // Evento para o botão Preencher
    preencherButton.addEventListener("click", function() {
        // Lógica de sugestão de preenchimento (simplificada para o mockup)
        const medicamento = medicamentoInput.value.toLowerCase();
        let sugestao = "";

        if (medicamento.includes("codein") && quantidadeInput.value.includes("120ml")) {
            sugestao = "Codein 3mg/ml - 120ml - 1 frasco\nTomar 5ml de 8/8h\nUSO ORAL - Tratamento Contínuo";
        } else if (medicamento.includes("fosfato de codeína") && medicamento.includes("cloridrato de prometazina")) {
            sugestao = "Solução Oral — 1 frasco (500ml)\nFosfato de Codeína — 15mg/ml\nCloridrato de Prometazina — 5mg/ml\nTomar 15ml de 08/08h\nUSO ORAL - Tratamento Contínuo";
        } else {
            sugestao = "Preenchimento sugerido com base nas informações fornecidas.";
        }
        sugestaoPreenchimentoTextarea.value = sugestao;
    });

    // Evento para o botão Gerar Receituário (apenas um placeholder por enquanto)
    gerarReceituarioButton.addEventListener("click", function() {
        alert("Funcionalidade de Gerar Receituário será implementada em breve!");
    });
});


