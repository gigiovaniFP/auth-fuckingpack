// ————————— CONFIGURE AQUI —————————
const SHEET_ID = '1D-fKwuWi0O7alSAiWx-0RuJZiSo0G8MRGTk_8kLYrdU';
// ————————————————————————————————————

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return { code: p.get('code'), test: p.get('test')==='true' };
}

async function fetchRows() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
  const res = await fetch(url);
  const txt = await res.text();
  const json = JSON.parse(txt.match(/setResponse\((.*)\)/s)[1]);
  return json.table.rows;
}

function getUsed() {
  return JSON.parse(localStorage.getItem('usedData')||'{}');
}
function markFirstUse(code) {
  const data = getUsed();
  if (!data[code]) data[code] = Date.now();
  localStorage.setItem('usedData', JSON.stringify(data));
}

function showStatus(msg, color='#4caf50') {
  const el=document.getElementById('status');
  el.textContent=msg; el.style.color=color;
}
function clearInfo() {
  document.getElementById('product-info').innerHTML='';
}

async function main(){
  const {code,test}=getParams();
  clearInfo();
  if(!code){ showStatus('⚠️ Código não fornecido.','#ff5555'); return; }
  let rows;
  try{ rows=await fetchRows(); }catch{ showStatus('❌ Erro ao carregar.','#ff5555'); return; }
  const row = rows.find(r=>r.c[0]&&r.c[0].v===code);
  if(!row){ showStatus('❌ Código inválido.','#ff5555'); return; }

  // Monta infos
  const labels=['Código','Cliente','Produto','Quantidade','Data de Geração','Primeira Autenticação','Status','Expiração','Observações'];
  const infoDiv = document.getElementById('product-info');
  labels.forEach((lbl,i)=>{
    const cell = row.c[i] && row.c[i].v;
    if(cell) infoDiv.innerHTML+=`<p><strong>${lbl}:</strong> ${cell}</p>`;
  });

  const used = getUsed(), first=used[code], now=Date.now();
  const expired = first && (now - first) > 7*24*60*60*1000;

  const btn=document.getElementById('test-btn');
  btn.style.display = test ? 'none' : 'inline-block';
  btn.onclick = ()=>{
    showStatus('✔️ Teste concluído (não registrou).');
  };

  if(test){
    showStatus('✔️ Autenticação de teste.');
  } else if(expired){
    showStatus('⌛ Autenticação expirada.','#ff5555');
  } else if(!first){
    markFirstUse(code);
    showStatus('✔️ Produto autenticado!');
  } else {
    showStatus('⚠️ Já autenticado antes.','#ff5555');
  }
}

window.onload = main;
