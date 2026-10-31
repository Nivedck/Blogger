import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el, hideAlert, showAlert } from "../core/dom.js";
import { renderNav } from "../components/navigation.js";

async function init() {
  await renderNav("/login.html");
  if (await getSession()) window.location.href = "/explore.html";
}

el("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  hideAlert("alert");
  const button = el("submit-btn");
  button.disabled = true;
  button.textContent = "Logging in…";

  const { ok, data } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: el("email").value.trim(),
      password: el("password").value
    })
  });

  if (ok) {
    window.location.href = "/explore.html";
    return;
  }

  showAlert("alert", data?.message || "Login failed");
  button.disabled = false;
  button.textContent = "Log in";
});

init();
