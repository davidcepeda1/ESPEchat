const login = document.querySelector("#login");

login.addEventListener("click", () => {
  const user = document.querySelector("#user").value;
  if (user != "") {
    document.cookie = `user=${user}`;
    document.location.href = "/";
  } else {
    alert("Please enter a username");
  }
});
