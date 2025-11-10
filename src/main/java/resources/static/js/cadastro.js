document.addEventListener("DOMContentLoaded", () => {
  // ======================================================
  // Seletores de elementos
  // ======================================================
  const form = document.getElementById("cadastroForm");
  const btnSubmit = document.getElementById("btnSubmit");
  const mensagem = document.getElementById("mensagem");

  // Campos comuns
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");

  // Checklist senha
  const checkTamanho = document.getElementById("check-tamanho");
  const checkMaiuscula = document.getElementById("check-maiuscula");
  const checkMinuscula = document.getElementById("check-minuscula");
  const checkEspecial = document.getElementById("check-especial");

  // Campos Pessoa
  const pessoaFields = document.getElementById("pessoaFields");
  const nomeInput = document.getElementById("nome");
  const sobrenomeInput = document.getElementById("sobrenome");
  const cpfInput = document.getElementById("cpf");

  // Campos Instituição
  const instituicaoFields = document.getElementById("instituicaoFields");
  const nomeInstituicaoInput = document.getElementById("nomeInstituicao");
  const cnpjInput = document.getElementById("cnpj");
  const responsavelInput = document.getElementById("responsavel");

  // Checkbox tipo usuário
  const checkboxes = document.querySelectorAll(".tipoUsuarioCheckbox");

  // ======================================================
  // Funções utilitárias
  // ======================================================

  const tipoSelecionado = () => {
    const selecionado = document.querySelector(".tipoUsuarioCheckbox:checked");
    return selecionado ? selecionado.value : null;
  };

  const atualizarChecklist = (elemento, valido) => {
    const icon = elemento.querySelector(".icon");
    if (valido) {
      elemento.classList.replace("text-red-500", "text-green-500");
      icon.textContent = "✅";
    } else {
      elemento.classList.replace("text-green-500", "text-red-500");
      icon.textContent = "❌";
    }
  };

  const validarSenha = (senha) => {
    const regras = {
      tamanho: senha.length >= 7,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha)
    };

    atualizarChecklist(checkTamanho, regras.tamanho);
    atualizarChecklist(checkMaiuscula, regras.maiuscula);
    atualizarChecklist(checkMinuscula, regras.minuscula);
    atualizarChecklist(checkEspecial, regras.especial);

    return Object.values(regras).every(v => v === true);
  };

  // ======================================================
  // ===== Validação de e-mail =====
  // ======================================================
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  // Feedback visual para e-mail
  /*
  emailInput.addEventListener("input", () => {
    const emailValido = validarEmail(emailInput.value);
    if (emailInput.value.trim() === "") {
      emailInput.classList.remove("border-red-500", "border-green-500");
    } else if (emailValido) {
      emailInput.classList.remove("border-red-500");
      emailInput.classList.add("border-green-500");
    } else {
      emailInput.classList.add("border-red-500");
      emailInput.classList.remove("border-green-500");
    }
  }); */

  // ======================================================
  // Validação CPF
  // ======================================================
  function validarCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let dig1 = resto > 9 ? 0 : resto;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let dig2 = resto > 9 ? 0 : resto;

    return cpf.endsWith(`${dig1}${dig2}`);
  }

  // Formata CPF automaticamente
  cpfInput.addEventListener("input", () => {
    let valor = cpfInput.value.replace(/\D/g, "").slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    cpfInput.value = valor;
  });

  // ======================================================
  // Validação CNPJ
  // ======================================================
  function validarCNPJ(cnpj) {
    if (!cnpj) return false;
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
  }

  // Formata CNPJ automaticamente
  cnpjInput.addEventListener("input", () => {
    let valor = cnpjInput.value.replace(/\D/g, "").slice(0, 14);
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    cnpjInput.value = valor;
  });

  // ======================================================
  // Validação geral dos campos
  // ======================================================
  const validarCampos = () => {
    const senhaValida = validarSenha(senhaInput.value);
    const emailValido = validarEmail(emailInput.value); // <<< adicionado
    const tipo = tipoSelecionado();
    let camposValidos = emailValido && senhaValida && tipo; // <<< alterado

    if (tipo === "pessoa") {
      camposValidos &&=
        nomeInput.value.trim() &&
        sobrenomeInput.value.trim() &&
        cpfInput.value.trim();
    } else if (tipo === "instituicao") {
      camposValidos &&=
        nomeInstituicaoInput.value.trim() &&
        cnpjInput.value.trim() &&
        responsavelInput.value.trim();
    }

    btnSubmit.disabled = !camposValidos;
  };

  // ======================================================
  // Eventos de input
  // ======================================================
  senhaInput.addEventListener("input", validarCampos);
  emailInput.addEventListener("input", validarCampos);
  [nomeInput, sobrenomeInput, cpfInput, nomeInstituicaoInput, cnpjInput, responsavelInput]
    .forEach(input => input.addEventListener("input", validarCampos));
  checkboxes.forEach(cb => cb.addEventListener("change", validarCampos));

  // ======================================================
  // Submissão do formulário
  // ======================================================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensagem.textContent = "";

    const tipo = tipoSelecionado();
    if (!tipo) {
      mensagem.textContent = "Selecione o tipo de usuário.";
      return;
    }

    // --- Valida e-mail antes do envio ---
    if (!validarEmail(emailInput.value)) {
      mensagem.textContent = "E-mail inválido. Verifique e tente novamente.";
      emailInput.focus();
      return;
    }

    // --- Valida CPF/CNPJ antes do envio ---
    if (tipo === "pessoa" && !validarCPF(cpfInput.value)) {
      mensagem.textContent = "CPF inválido. Verifique e tente novamente.";
      cpfInput.focus();
      return;
    }

    if (tipo === "instituicao" && !validarCNPJ(cnpjInput.value)) {
      mensagem.textContent = "CNPJ inválido. Verifique e tente novamente.";
      cnpjInput.focus();
      return;
    }

    // Montar payload de acordo com o tipo
    let usuario;
    let endpoint;

    if (tipo === "pessoa") {
      usuario = {
        nome: nomeInput.value.trim(),
        cpf: cpfInput.value.replace(/\D/g, ""),
        email: emailInput.value.trim().toLowerCase(), // <<< força minúsculo
        senha: senhaInput.value.trim()
      };
      endpoint = "http://localhost:8080/api/consumidor";
    } else {
      usuario = {
        nome: nomeInstituicaoInput.value.trim(),
        cnpj: cnpjInput.value.replace(/\D/g, ""),
        email: emailInput.value.trim().toLowerCase(), // <<< força minúsculo
        senha: senhaInput.value.trim()
      };
      endpoint = "http://localhost:8080/api/instituicao";
    }

    try {
      const resposta = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });

      if (resposta.ok) {
        const usuarioCriado = await resposta.json();
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioCriado));

        mensagem.classList.replace("text-red-500", "text-green-500");
        mensagem.textContent = "Cadastro realizado com sucesso!";
        form.reset();
        btnSubmit.disabled = true;
        pessoaFields.classList.add("hidden");
        instituicaoFields.classList.add("hidden");

        setTimeout(() => window.location.href = "meu_perfil.html", 1500);
      } else if (resposta.status === 409) {
          const erro = await resposta.text();
          if (erro.includes("email")) {
            mensagem.textContent = "E-mail já cadastrado. Tente outro.";
          } else if (tipo === "pessoa" && erro.includes("cpf")) {
            mensagem.textContent = "CPF já cadastrado.";
          } else if (tipo === "instituicao" && erro.includes("cnpj")) {
            mensagem.textContent = "CNPJ já cadastrado.";
          } else {
            mensagem.textContent = "Usuário já cadastrado.";
          }
        } else {
        const erro = await resposta.text();
        mensagem.textContent = erro || "Erro ao cadastrar usuário.";
      }

    } catch (err) {
      console.error(err);
      mensagem.textContent = "Erro de conexão com o servidor.";
    }
  });
});
