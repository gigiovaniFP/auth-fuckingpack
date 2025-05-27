async function carregarDados() {
  const sheetID = "SEU_ID_DO_GOOGLE_SHEET_AQUI";
  const range = "Sheet1!A1:D50"; // ajuste para seu intervalo real
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${range}?key=SUA_API_KEY_DO_GOOGLE`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const linhas = data.values;

    let html = "<table border='1'>";
    for (const linha of linhas) {
      html += "<tr>";
      for (const celula of linha) {
        html += `<td>${celula}</td>`;
      }
      html += "</tr>";
    }
    html += "</table>";

    document.getElementById("dataContainer").innerHTML = html;
  } catch (err) {
    document.getElementById("dataContainer").innerText = "Erro ao carregar dados.";
  }
}
