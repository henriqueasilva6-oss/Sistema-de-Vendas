const CHAVE_STORAGE = 'tarefas';

const form = document.querySelector('form');
const inputTarefa = document.getElementById('tarefa');
const inputDescricao = document.getElementById('descricao');
const inputPrazo = document.getElementById('prazo');
const btnSubmit = form ? form.querySelector('button[type="submit"]') : null;
const filtroStatus = document.getElementById('status-filtro');
const tbody = document.querySelector('table tbody');

let btnCancelar = document.getElementById('btn-cancelar');
if (!btnCancelar && btnSubmit) {
  btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.id = 'btn-cancelar';
  btnCancelar.className = 'btn-cancelar';
  btnCancelar.textContent = 'Cancelar edição';
  btnCancelar.style.display = 'none';
  btnSubmit.insertAdjacentElement('afterend', btnCancelar);
}

let idEmEdicao = null;

const tarefasIniciais = [
  {
    id: '1',
    tarefa: 'Tarefa 1',
    descricao: 'Descrição 1',
    prazo: '2022-12-31',
    status: 'Pendente'
  },
  {
    id: '2',
    tarefa: 'Tarefa 2',
    descricao: 'Descrição 2',
    prazo: '2022-12-31',
    status: 'Pendente'
  },
  {
    id: '3',
    tarefa: 'Tarefa 3',
    descricao: 'Descrição 3',
    prazo: '2022-12-31',
    status: 'Concluída'
  }
];

function obterTarefas() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  if (dados !== null) {
    try {
      return JSON.parse(dados);
    } catch (e) {
      console.error('Erro ao ler dados do localStorage:', e);
      return [];
    }
  }

  salvarTarefas(tarefasIniciais);
  return [...tarefasIniciais];
}

function salvarTarefas(tarefas) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
}

function renderizarTarefas() {
  if (!tbody) return;

  const tarefas = obterTarefas();
  const filtro = filtroStatus ? filtroStatus.value : 'todos';

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === 'pendente') {
      return tarefa.status.toLowerCase().includes('pendente');
    }
    if (filtro === 'concluido') {
      return tarefa.status.toLowerCase().includes('conclu');
    }
    return true;
  });

  tbody.innerHTML = '';

  if (tarefasFiltradas.length === 0) {
    const trVazia = document.createElement('tr');
    trVazia.innerHTML = `
      <td colspan="5" style="text-align: center; color: #777; padding: 18px;">
        Nenhuma tarefa encontrada.
      </td>
    `;
    tbody.appendChild(trVazia);
    return;
  }

  tarefasFiltradas.forEach((tarefa) => {
    const tr = document.createElement('tr');
    const estaConcluida = tarefa.status.toLowerCase().includes('conclu');

    const classeBadge = estaConcluida ? 'badge-status badge-concluida' : 'badge-status badge-pendente';

    tr.innerHTML = `
      <td>${escapeHTML(tarefa.tarefa)}</td>
      <td>${escapeHTML(tarefa.descricao)}</td>
      <td>${escapeHTML(tarefa.prazo)}</td>
      <td><span class="${classeBadge}">${escapeHTML(tarefa.status)}</span></td>
      <td class="acoes">
        <button type="button" class="btn-concluir" data-id="${tarefa.id}">
          ${estaConcluida ? 'Reabrir tarefa' : 'Concluir tarefa'}
        </button>
        <button type="button" class="btn-editar" data-id="${tarefa.id}">
          Editar tarefa
        </button>
        <button type="button" class="btn-excluir" data-id="${tarefa.id}">
          Excluir tarefa
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function escapeHTML(texto) {
  if (!texto) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const tarefaTexto = inputTarefa ? inputTarefa.value.trim() : '';
    const descricaoTexto = inputDescricao ? inputDescricao.value.trim() : '';
    const prazoTexto = inputPrazo ? inputPrazo.value : '';

    if (!tarefaTexto || !descricaoTexto || !prazoTexto) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const tarefas = obterTarefas();

    if (idEmEdicao !== null) {
      const index = tarefas.findIndex((t) => t.id === idEmEdicao);
      if (index !== -1) {
        tarefas[index].tarefa = tarefaTexto;
        tarefas[index].descricao = descricaoTexto;
        tarefas[index].prazo = prazoTexto;
      }
      cancelarEdicao();
    } else {
      const novaTarefa = {
        id: Date.now().toString(),
        tarefa: tarefaTexto,
        descricao: descricaoTexto,
        prazo: prazoTexto,
        status: 'Pendente'
      };
      tarefas.push(novaTarefa);
      form.reset();
    }

    salvarTarefas(tarefas);
    renderizarTarefas();
  });
}

function iniciarEdicao(id) {
  const tarefas = obterTarefas();
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  idEmEdicao = id;
  if (inputTarefa) inputTarefa.value = tarefa.tarefa;
  if (inputDescricao) inputDescricao.value = tarefa.descricao;
  if (inputPrazo) inputPrazo.value = tarefa.prazo;

  if (btnSubmit) btnSubmit.textContent = 'Salvar Alterações';
  if (btnCancelar) btnCancelar.style.display = 'block';

  if (inputTarefa) {
    inputTarefa.focus();
  }
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelarEdicao() {
  idEmEdicao = null;
  if (form) form.reset();
  if (btnSubmit) btnSubmit.textContent = 'Cadastrar';
  if (btnCancelar) btnCancelar.style.display = 'none';
}

if (btnCancelar) {
  btnCancelar.addEventListener('click', cancelarEdicao);
}

function alternarStatusTarefa(id) {
  const tarefas = obterTarefas();
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  if (tarefa.status.toLowerCase().includes('conclu')) {
    tarefa.status = 'Pendente';
  } else {
    tarefa.status = 'Concluída';
  }

  salvarTarefas(tarefas);
  renderizarTarefas();
}

function excluirTarefa(id) {
  const tarefas = obterTarefas();
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  const confirmou = confirm(`Deseja realmente excluir a tarefa "${tarefa.tarefa}"?`);
  if (!confirmou) return;

  const novasTarefas = tarefas.filter((t) => t.id !== id);
  salvarTarefas(novasTarefas);

  if (idEmEdicao === id) {
    cancelarEdicao();
  }

  renderizarTarefas();
}

if (tbody) {
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains('btn-concluir')) {
      alternarStatusTarefa(id);
    } else if (btn.classList.contains('btn-editar')) {
      iniciarEdicao(id);
    } else if (btn.classList.contains('btn-excluir')) {
      excluirTarefa(id);
    }
  });
}

if (filtroStatus) {
  filtroStatus.addEventListener('change', () => {
    renderizarTarefas();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarTarefas();
});

renderizarTarefas();
