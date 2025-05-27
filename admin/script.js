async function carregarDados() {
  const container = document.getElementById("dados");
  container.innerHTML = "Carregando...";

  try {
    const response = await fetch("https://api.sheetson.com/v2/sheets/Sheet1", {
      headers: {
        "Authorization": "Bearer sua-chave-sheetson",
        "X-Spreadsheet-Id": "ID-DA-SUA-PLANILHA"
      }
    });

    const data = await response.json();
    container.innerHTML = gerarTabela(data.results);
  } catch (e) {
    container.innerHTML = "Erro ao carregar dados.";
  }
}

carregarDados();
