// ===============================================
// CONFIGURAÇÕES
// ===============================================
const API_URL = "http://localhost:8080/api/medicamentos";
const API_INSTITUICOES = "http://localhost:8080/api/instituicao";

// ===============================================
// FUNÇÃO PRINCIPAL – LISTAR MEDICAMENTOS
// ===============================================
async function carregarMedicamentos(filtros = {}) {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Erro ao buscar medicamentos");

    const medicamentos = await resposta.json();
    renderizarMedicamentos(filtrarMedicamentos(medicamentos, filtros));
  } catch (erro) {
    console.error("Erro ao carregar medicamentos:", erro);
    document.getElementById("medicamentosGrid").innerHTML = `
      <div class="col-12 text-center text-danger">
        Ocorreu um erro ao carregar os medicamentos.
      </div>`;
  }
}

// ===============================================
// FUNÇÃO – RENDERIZAR CARDS
// ===============================================
function renderizarMedicamentos(lista) {
  const grid = document.getElementById("medicamentosGrid");
  grid.innerHTML = "";

  if (lista.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center text-muted">Nenhum medicamento encontrado.</div>`;
    return;
  }

  lista.forEach((m) => {
    const diasParaVencer = calcularDiasParaVencer(m.validade);
    let alerta = "";

    if (diasParaVencer > 0 && diasParaVencer <= 30) {
      alerta = `<span class="badge-alerta"><i class="bi bi-exclamation-triangle-fill"></i> Vence em ${diasParaVencer} dias</span>`;
    }

    const precoFormatado = m.preco ? `R$ ${parseFloat(m.preco).toFixed(2).replace('.', ',')}` : "—";

    const card = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card-medicamento shadow-sm fadeIn">
          <img src="${m.fotoUrl}" alt="${m.nome}">
          <div class="card-overlay"></div>
          ${alerta}
          <div class="card-body">
            <h5>${m.nome}</h5>
            <p><strong>Preço:</strong> ${precoFormatado}</p>
            <p><strong>Quantidade:</strong> ${m.quantidade ?? 0}</p>
            <p><strong>Validade:</strong> ${formatarDataBR(m.validade)}</p>
            <p><strong>Instituição:</strong> ${m.instituicao?.nome ?? "—"}</p>
            <button class="btn btn-sm btn-outline-primary mt-2" onclick="verDetalhes(${m.id})">
              <i class="bi bi-eye"></i> Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `;
    grid.innerHTML += card;
  });
}

// ===============================================
// FUNÇÃO – FILTRAR MEDICAMENTOS
// ===============================================
function filtrarMedicamentos(lista, filtros) {
  return lista.filter((m) => {
    const dias = calcularDiasParaVencer(m.validade);

    // ❌ Ignora medicamentos já vencidos
    if (dias < 0) return false;

    if (filtros.dias > 0 && dias > filtros.dias) return false;
    if (filtros.preco > 0 && m.preco > filtros.preco) return false;
    if (filtros.nome && !m.nome.toLowerCase().includes(filtros.nome.toLowerCase())) return false;
    if (filtros.instituicaoId > 0 && m.instituicao?.id !== filtros.instituicaoId) return false;

    return true;
  });
}

// ===============================================
// FUNÇÃO – CALCULAR DIAS ATÉ O VENCIMENTO
// ===============================================
function calcularDiasParaVencer(validadeStr) {
  if (!validadeStr) return 9999;
  const hoje = new Date();
  const validade = new Date(validadeStr);
  const diff = validade - hoje;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ===============================================
// FUNÇÃO – CARREGAR INSTITUIÇÕES NO SELECT
// ===============================================
async function carregarInstituicoes() {
  const select = document.getElementById("filtroInstituicao");
  try {
    const resposta = await fetch(API_INSTITUICOES);
    if (!resposta.ok) throw new Error("Erro ao carregar instituições");
    const instituicoes = await resposta.json();

    instituicoes.forEach((inst) => {
      const option = document.createElement("option");
      option.value = inst.id;
      option.textContent = inst.nome;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error("Erro ao carregar instituições:", erro);
  }
}

// ===============================================
// EVENTOS – FILTROS E BUSCA
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
  const filtroDias = document.getElementById("filtroDias");
  const filtroPreco = document.getElementById("filtroPreco");
  const filtroInstituicao = document.getElementById("filtroInstituicao");
  const campoBusca = document.querySelector("input[placeholder='Buscar medicamentos...']");
  const formBusca = campoBusca.closest("form");

  formBusca.addEventListener("submit", (e) => {
    e.preventDefault();
    const filtros = {
      dias: parseInt(filtroDias.value),
      preco: parseFloat(filtroPreco.value),
      nome: campoBusca.value.trim(),
      instituicaoId: parseInt(filtroInstituicao.value),
    };
    carregarMedicamentos(filtros);
  });

  [filtroDias, filtroPreco, filtroInstituicao].forEach((el) =>
    el.addEventListener("change", () =>
      carregarMedicamentos({
        dias: parseInt(filtroDias.value),
        preco: parseFloat(filtroPreco.value),
        nome: campoBusca.value.trim(),
        instituicaoId: parseInt(filtroInstituicao.value),
      })
    )
  );

  carregarInstituicoes();
  carregarMedicamentos();
});

// ===============================================
// FUNÇÃO – FORMATAR DATA PARA DD/MM/YYYY
// ===============================================
function formatarDataBR(dataStr) {
  if (!dataStr) return "—";
  const data = new Date(dataStr);
  if (isNaN(data)) return "—";
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// ===============================================
// FUNÇÃO – VER DETALHES DO MEDICAMENTO
// ===============================================
async function verDetalhes(id) {
  const modalBody = document.getElementById("detalhesMedicamentoBody");
  const btnContato = document.getElementById("btnContato");
  modalBody.innerHTML = `
    <div class="text-muted py-4">
      <div class="spinner-border text-primary" role="status"></div><br>Carregando detalhes...
    </div>`;

  const modal = new bootstrap.Modal(document.getElementById("modalDetalhes"));
  modal.show();

  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar detalhes do medicamento.");

    const m = await resposta.json();
    const diasParaVencer = calcularDiasParaVencer(m.validade);
    const precoFormatado = m.preco ? `R$ ${parseFloat(m.preco).toFixed(2).replace('.', ',')}` : "—";
    const alerta = diasParaVencer <= 30
      ? `<span class="badge-alerta"><i class="bi bi-exclamation-triangle-fill"></i> Vence em ${diasParaVencer} dias</span>`
      : "";

    modalBody.innerHTML = `
      <div class="row g-4 align-items-center">
        <div class="col-md-5 text-center">
          <img src="${m.fotoUrl}" alt="${m.nome}" class="img-fluid rounded shadow-sm" style="max-height: 260px; object-fit: cover;">
          <div class="mt-2">${alerta}</div>
        </div>
        <div class="col-md-7 text-start">
          <h4 class="mb-3" style="color: #4a4a4a;" ><i class="bi bi-capsule"></i> ${m.nome}</h4>
          <p><strong><i class="bi bi-info-circle"></i> Descrição:</strong><br>${m.descricao ?? "Sem descrição disponível."}</p>
          <p><strong><i class="bi bi-cash-coin"></i> Preço:</strong> ${precoFormatado}</p>
          <p><strong><i class="bi bi-box-seam"></i> Quantidade:</strong> ${m.quantidade ?? 0}</p>
          <p><strong><i class="bi bi-calendar-event"></i> Validade:</strong> ${formatarDataBR(m.validade)}</p>
        </div>
      </div>
      <hr class="my-4">
      <div class="text-start">
        <h5 class="text-secondary mb-2"><i class="bi bi-hospital"></i> Instituição Responsável</h5>
        <p class="mb-1"><strong>Nome:</strong> ${m.instituicao?.nome ?? "—"}</p>
        <p class="mb-1"><strong>Telefone:</strong> ${m.instituicao?.telefone ?? "—"}</p>
        <p class="mb-0"><strong>Email:</strong> ${m.instituicao?.email ?? "—"}</p>
      </div>
    `;

    // Configura botão de contato
    btnContato.onclick = () => {
      if (m.instituicao?.email)
        window.location.href = `mailto:${m.instituicao.email}?subject=Interesse no medicamento ${m.nome}`;
      else
        alert("Esta instituição não possui e-mail cadastrado.");
    };

  } catch (erro) {
    console.error("Erro ao carregar detalhes:", erro);
    modalBody.innerHTML = `<div class="text-danger py-3">Erro ao carregar detalhes do medicamento.</div>`;
  }
}
