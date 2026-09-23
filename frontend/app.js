const API_REGISTER = "http://localhost:5000/api/auth/register";

const getMessageEl = () => document.getElementById("message");

// Register page
if (document.getElementById("registerForm")) {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const msg = getMessageEl();
    if (msg) msg.textContent = "";

    try {
      const res = await fetch(API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json().catch(() => ({ message: res.statusText }));

      if (!res.ok) {
        if (msg) msg.textContent = data.message || "Registration failed";
        return;
      }

      localStorage.setItem("bloggrUser", JSON.stringify({ name: data.user?.name || name }));
      window.location.href = "home.html";
    } catch (err) {
      if (msg) msg.textContent = "Could not reach server";
    }
  });
}

// Home page
if (document.getElementById("greet")) {
  const u = JSON.parse(localStorage.getItem("bloggrUser") || "null");
  const greet = document.getElementById("greet");
  greet.textContent = u?.name ? `Hello, ${u.name}!` : "Welcome!";
  const logout = document.getElementById("logout");
  if (logout) logout.addEventListener("click", () => {
    localStorage.removeItem("bloggrUser");
    location.href = "index.html";
  });
}
