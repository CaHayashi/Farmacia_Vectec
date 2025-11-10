document.addEventListener("DOMContentLoaded", () => {
  // ======================================================
  // Seletores
  // ======================================================
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const cpfInput = document.getElementById("cpf");
  const cnpjInput = document.getElementById("cnpj");
  const telefoneInput = document.getElementById("telefone");
  const enderecoInput = document.getElementById("endereco");
  const fotoUrlInput = document.getElementById("fotoUrl");
  const fotoPreview = document.getElementById("fotoPerfil");
  const btnSalvar = document.getElementById("btnSalvar");
  const mensagemDiv = document.getElementById("mensagem");

  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const isInstituicao = localStorage.getItem("isInstituicao") === "true";

  // ======================================================
  // Redireciona se não logado
  // ======================================================
  if (!usuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  // ======================================================
  // Preenche campos
  // ======================================================
  nomeInput.value = usuarioLogado.nome || "";
  emailInput.value = usuarioLogado.email || "";
  emailInput.readOnly = true; // e-mail não alterável
  senhaInput.value = usuarioLogado.senha || "";
  telefoneInput.value = usuarioLogado.telefone || "";
  enderecoInput.value = usuarioLogado.endereco || "";
  fotoPreview.src = usuarioLogado.fotoUrl || "/images/default.png";
  fotoUrlInput.value = usuarioLogado.fotoUrl || "";

  // CPF e CNPJ bloqueados (não editáveis)
  if (usuarioLogado.cpf) {
    cpfInput.value = formatarCPF(usuarioLogado.cpf);
    cpfInput.parentElement.style.display = "block";
    cnpjInput.parentElement.style.display = "none";
    cpfInput.readOnly = true;
    cpfInput.disabled = true;
  } else if (usuarioLogado.cnpj) {
    cnpjInput.value = formatarCNPJ(usuarioLogado.cnpj);
    cnpjInput.parentElement.style.display = "block";
    cpfInput.parentElement.style.display = "none";
    cnpjInput.readOnly = true;
    cnpjInput.disabled = true;
  }

  // ======================================================
  // Funções de formatação
  // ======================================================
  function formatarCPF(valor) {
    valor = valor.replace(/\D/g, "").slice(0, 11);
    return valor
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatarCNPJ(valor) {
    valor = valor.replace(/\D/g, "").slice(0, 14);
    return valor
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  // ======================================================
  // Validação e mensagens
  // ======================================================
  function validarSenha(senha) {
    return senha && senha.length >= 6;
  }

  function mostrarMensagem(tipo, texto) {
    mensagemDiv.innerHTML = `<div class="alert alert-${tipo} fadeIn" role="alert">${texto}</div>`;
  }

  // ======================================================
  // Preview da foto
  // ======================================================
  fotoUrlInput.addEventListener("input", () => {
    const url = fotoUrlInput.value.trim();
    fotoPreview.src = url || "/images/default.png";
  });

  // ======================================================
  // Atualizar perfil
  // ======================================================
  btnSalvar.addEventListener("click", async function () {
    mensagemDiv.innerHTML = "";

    const nome = nomeInput.value.trim();
    const senha = senhaInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const endereco = enderecoInput.value.trim();
    const fotoUrl = fotoUrlInput.value.trim() || "/images/default.png";

    if (!nome || !senha) {
      mostrarMensagem("warning", "⚠️ Nome e senha são obrigatórios.");
      return;
    }

    if (!validarSenha(senha)) {
      mostrarMensagem("warning", "⚠️ A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Monta objeto atualizado (sem CPF/CNPJ)
    const dadosAtualizados = {
      id: usuarioLogado.id,
      nome,
      email: usuarioLogado.email,
      senha,
      telefone,
      endereco,
      fotoUrl,
      cpf: usuarioLogado.cpf,
      cnpj: usuarioLogado.cnpj,
    };

    console.log("✅ Payload enviado:", dadosAtualizados);

    const endpoint = usuarioLogado.cpf
      ? `http://localhost:8080/api/consumidor/${usuarioLogado.id}`
      : `http://localhost:8080/api/instituicao/${usuarioLogado.id}`;

    try {
      const resposta = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAtualizados),
      });

      if (!resposta.ok) {
        const erro = await resposta.text();
        throw new Error(erro || "Erro ao atualizar perfil.");
      }

      const usuarioAtualizado = await resposta.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
      mostrarMensagem("success", "✅ Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      mostrarMensagem("danger", `⚠️ ${err.message}`);
    }
  });

  // ======================================================
  // Logout
  // ======================================================
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      localStorage.removeItem("isInstituicao");
      window.location.href = "login.html";
    });
  }
});
