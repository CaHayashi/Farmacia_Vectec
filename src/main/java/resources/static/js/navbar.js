document.addEventListener('DOMContentLoaded', () => {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  const linkMeusMedicamentos = document.querySelector('a[href="medicamentos_instituicao.html"]');
  const btnLogout = document.getElementById('btnLogout');

  // Se o usuário não estiver logado, redireciona para login
  if (!usuarioLogado) {
    console.warn("Nenhum usuário logado — redirecionando para login.html");
    window.location.href = "login.html";
    return;
  }

  // Controle de visibilidade do link "Meus Medicamentos"
  if (usuarioLogado.cnpj) {
    if (linkMeusMedicamentos) linkMeusMedicamentos.style.display = "block";
  } else {
    if (linkMeusMedicamentos) linkMeusMedicamentos.style.display = "none";
  }

  // Logout global
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuarioLogado");
      window.location.href = "login.html";
    });
  }
});
