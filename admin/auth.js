function login() {
  const senha = document.getElementById("password").value;
  if (senha === "WELITALLDAY") { // você pode trocar essa senha
    document.getElementById("loginContainer").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    carregarDados();
  } else {
    alert("Senha incorreta!");
  }
}
