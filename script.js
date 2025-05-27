function getCodigoDaURL() {
  const url = new URL(window.location.href);
  return url.searchParams.get("id") || "desconhecido";
}

async function autenticar() {
  const codigo = getCodigoDaURL();
  const resultado = document.getElementById("resultado");

  resultado.innerText = "Autenticando...";

  try {
    const response = await fetch(`https://api.sheetson.com/v2/sheets/Sheet1?id=${codigo}`, {
      headers: {
        "Authorization": "Bearer sua-chave-sheetson",
        "X-Spreadsheet-Id": "ID-DA-SUA-PLANILHA"
      }
    });

    const data = await response.json();

    if (data?.status === "autenticado") {
      resultado.innerText = "Este código já foi autenticado.";
    } else {
      await fetch(`https://api.sheetson.com/v2/sheets/Sheet1/${codigo}`, {
        method: "PUT",
        headers: {
          "Authorization": "Bearer sua-chave-sheetson",
          "X-Spreadsheet-Id": "ID-DA-SUA-PLANILHA",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "autenticado",
          data: new Date().toISOString().split("T")[0]
        })
      });
      resultado.innerText = "Produto autenticado com sucesso.";
    }
  } catch (e) {
    resultado.innerText = "Erro na autenticação.";
  }
}
