function gerarTabela(linhas) {
  let html = "<table><tr><th>Código</th><th>Status</th><th>Data</th></tr>";
  linhas.forEach(l => {
    html += `<tr><td>${l.id}</td><td>${l.status}</td><td>${l.data || '-'}</td></tr>`;
  });
  html += "</table>";
  return html;
}
