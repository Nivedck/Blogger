import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el, hideAlert, showAlert } from "../core/dom.js";
import { renderNav } from "../components/navigation.js";

async function init() {
  await renderNav("/register.html");
  if (await getSession()) window.location.href = "/explore.html";
}

el("register-form").addEventListener("submit", async event => {
  event.preventDefault();
  hideAlert("alert");

  const name = el("name").value.trim();
  const email = el("email").value.trim();
  const password = el("password").value;
  if (password.length < 8) {
    showAlert("alert", "Password must be at least 8 characters");
    return;
  }

  const button = el("submit-btn");
  button.disabled = true;
  button.textContent = "Creating account…";
  const { ok, data } = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });

  if (ok) {
    window.location.href = "/explore.html";
    return;
  }

  showAlert("alert", data?.message || "Registration failed");
  button.disabled = false;
  button.textContent = "Create account";
});

init();
