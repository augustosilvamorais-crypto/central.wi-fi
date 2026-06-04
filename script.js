// Dados remotos reais devem vir do back-end. Aqui usamos chamadas de API.
let token = null;
let networksData = [];

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', onLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', onLogout);
  loadNetworks(); // tenta carregar, se não estiver autenticado, o back-end rejeitará
});

function onLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data && data.token) {
      token = data.token;
      document.getElementById('loginSection').hidden = true;
      document.getElementById('dashboard').hidden = false;
      loadNetworks();
    } else {
      alert(data?.message || 'Falha no login.');
    }
  })
  .catch(() => alert('Erro de rede durante o login.'));
}

function onLogout() {
  token = null;
  fetch('/api/logout', { method: 'POST', headers: authHeader() }).catch(() => {});
  document.getElementById('dashboard').hidden = true;
  document.getElementById('loginSection').hidden = false;
  document.getElementById('loginForm').reset();
  networksData = [];
  renderNetworks();
}

function authHeader() {
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function loadNetworks() {
  fetch('/api/networks', { headers: authHeader() })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data?.networks)) {
        networksData = data.networks;
        renderNetworks();
      } else {
        // Possível token expirado
        alert('Sessão expirada. Faça login novamente.');
        onLogout();
      }
    })
    .catch(() => alert('Falha ao buscar redes.'));
}

function renderNetworks() {
  const tbody = document.getElementById('networksBody');
  tbody.innerHTML = '';
  networksData.forEach(net => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${net.id}</td>
      <td>${net.name}</td>
      <td>${net.locked ? 'Bloqueada' : 'Ativa'}</td>
      <td>${net.quotaGigs}</td>
      <td>
        <button class="btn" data-action="lock" data-id="${net.id}" ${net.locked ? 'disabled' : ''}>Bloquear</button>
        <button class="btn" data-action="unlock" data-id="${net.id}" ${!net.locked ? 'disabled' : ''}>Desbloquear</button>
        <button class="btn" data-action="quota" data-id="${net.id}">Ajustar Gigas</button>
        <button class="btn" data-action="password" data-id="${net.id}">Trocar Senha</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (action === 'lock') lockNetwork(id);
      else if (action === 'unlock') unlockNetwork(id);
      else if (action === 'quota') openQuotaModal(id);
      else if (action === 'password') openPasswordModal(id);
    });
  });
}

// Chamada de API para operações reais (substitua pelo seu back-end)
function lockNetwork(id) {
  fetch(`/api/networks/${id}/lock`, { method: 'POST', headers: authHeader() })
    .then(res => res.json())
    .then(r => r.success ? loadNetworks() : alert('Falha ao bloquear.'))
    .catch(() => alert('Erro na requisição de bloqueio.'));
}
function unlockNetwork(id) {
  fetch(`/api/networks/${id}/unlock`, { method: 'POST', headers: authHeader() })
    .then(res => res.json())
    .then(r => r.success ? loadNetworks() : alert('Falha ao desbloquear.'))
    .catch(() => alert('Erro na requisição de desbloqueio.'));
}

let quotaModalNetworkId = null;
function openQuotaModal(id) {
  quotaModalNetworkId = id;
  const net = networksData.find(n => n.id === id);
  const current = net?.quotaGigs ?? 0;
  showModal('Ajustar Gigas', `
    <p>${net.name} - Gigas atuais: ${current}</p>
    <label for="quotaInput">Novo total (GB):</label>
    <input id="quotaInput" type="number" min="0" value="${current}">
  `);
}
function openPasswordModal(id) {
  quotaModalNetworkId = id;
  showModal('Trocar Senha da Rede', `
    <label for="newPassword">Nova senha:</label>
    <input id="newPassword" type="password" placeholder="Nova senha">
  `);
}

function showModal(title, contentHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = contentHTML;
  const modal = document.getElementById('modal');
  modal.hidden = false;

  document.getElementById('modalCancel').onclick = () => { modal.hidden = true; };
  document.getElementById('modalConfirm').onclick = () => {
    if (title === 'Ajustar Gigas') {
      const val = parseInt(document.getElementById('quotaInput').value, 10);
      if (!isNaN(val)) setQuota(quotaModalNetworkId, val);
    } else if (title === 'Trocar Senha da Rede') {
      const newPass = document.getElementById('newPassword').value;
      setPassword(quotaModalNetworkId, newPass);
    }
    modal.hidden = true;
  };
}

function setQuota(id, value) {
  fetch(`/api/networks/${id}/quota`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ quotaGigs: value })
  })
  .then(res => res.json())
  .then(r => r.success ? loadNetworks() : alert('Falha ao ajustar a quota.'))
  .catch(() => alert('Erro na requisição de quota.'));
}
function setPassword(id, newPassword) {
  fetch(`/api/networks/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ newPassword })
  })
  .then(res => res.json())
  .then(r => r.success ? alert('Senha atualizada (produção)') : alert('Falha ao atualizar senha.'))
  .catch(() => alert('Erro na requisição de senha.'));
}
