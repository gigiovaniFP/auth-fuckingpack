const scriptURL = 'https://script.google.com/macros/s/AKfycbyBQ6KuGjAUetKFtKLhqXbTc1jfZbRNno4u8PRUAE6_V79Ky3PE5PvrX1eYrnVReiFTCg/exec';

function carregarDados() {
  fetch(scriptURL)
    .then(response => response.json())
    .then(data => exibirTabela(data))
    .catch(error => {
      document.getElementById('resultado').innerHTML = 'Erro ao carregar dados.';
      console.error(error);
    });
}

function exibirTabela(data) {
  if (!data || data.length === 0) {
    document.getElementById('resultado').innerHTML = 'Nenhum dado encontrado.';
    return;
  }

  let html = '<table><tr>';
  Object.keys(data[0]).forEach(coluna => {
    html += `<th>${coluna}</th>`;
  });
  html += '</tr>';

  data.forEach(linha => {
    html += '<tr>';
    Object.values(linha).forEach(valor => {
      html += `<td>${valor}</td>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  document.getElementById('resultado').innerHTML = html;
}
