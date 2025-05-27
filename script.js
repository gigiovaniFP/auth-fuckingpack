const params = new URLSearchParams(window.location.search);
const codigo = params.get("codigo");

if (!codigo) {
  document.getElementById("resultado").innerText = "Código não fornecido.";
} else {
  fetch(`https://script.google.com/macros/s/AKfycbyBQ6KuGjAUetKFtKLhqXbTc1jfZbRNno4u8PRUAE6_V79Ky3PE5PvrX1eYrnVReiFTCg/exec?codigo=${codigo}`)
    .then(res => res.json())
    .then(data => {
      if (!data["Cliente"]) {
        document.getElementById("resultado").innerText = "Código inválido.";
        return;
      }

      document.getElementById("resultado").innerHTML = `
        <strong>✅ Código válido!</strong><br><br>
        <b>Cliente:</b> ${data["Cliente"]}<br>
        <b>Produto:</b> ${data["Produto"]}<br>
        <b>Data:</b> ${data["Data de Autenticação"] || 'Autenticado agora'}<br>
      `;
    })
    .catch(() => {
      document.getElementById("resultado").innerText = "Erro ao verificar o código.";
    });
}
