import { api } from "../core/api.js";
import { clearSession, getSession } from "../core/auth.js";

export async function renderNav(activeHref = "") {
  const user = await getSession();
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  const links = user
    ? [
        { href: "/explore.html", label: "Explore" },
        { href: "/editor.html", label: "Write" },
        { href: `/profile.html?id=${user._id}`, label: "Profile" },
        ...(user.role === "admin" ? [{ href: "/admin.html", label: "Admin" }] : []),
        { href: "#", label: "Log out", id: "nav-logout" }
      ]
    : [
        { href: "/explore.html", label: "Explore" },
        { href: "/login.html", label: "Log in" },
        { href: "/register.html", label: "Register" }
      ];

  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="/"><span class="brand-mark">B</span>Bloggr</a>
      <ul class="nav-links">
        ${links.map(link =>
          `<li><a href="${link.href}" ${link.id ? `id="${link.id}"` : ""}
            class="${link.href === activeHref ? "active" : ""}">${link.label}</a></li>`
        ).join("")}
      </ul>
    </div>`;

  document.getElementById("nav-logout")?.addEventListener("click", async event => {
    event.preventDefault();
    await api("/api/auth/logout", { method: "POST" });
    clearSession();
    window.location.href = "/login.html";
  });
}
