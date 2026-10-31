/**
 * shared.js – utilities used by all pages.
 */


async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}


let _session = null;

async function getSession(force = false) {
  if (_session && !force) return _session;
  const { ok, data } = await api("/api/auth/me");
  _session = ok ? data.user : null;
  return _session;
}

async function requireSession(redirectTo = "/login.html") {
  const user = await getSession();
  if (!user) { window.location.href = redirectTo; return null; }
  return user;
}

async function requireAdmin(redirectTo = "/") {
  const user = await getSession();
  if (!user || user.role !== "admin") { window.location.href = redirectTo; return null; }
  return user;
}


async function renderNav(activeHref = "") {
  const user = await getSession();
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  const links = user
    ? [
        { href: "/explore.html", label: "Explore" },
        { href: "/editor.html",  label: "Write" },
        { href: `/profile.html?id=${user._id}`, label: "Profile" },
        ...(user.role === "admin" ? [{ href: "/admin.html", label: "Admin" }] : []),
        { href: "#", label: "Log out", id: "nav-logout" }
      ]
    : [
        { href: "/explore.html", label: "Explore" },
        { href: "/login.html",   label: "Log in" },
        { href: "/register.html",label: "Register" }
      ];

  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-brand" href="/"><span class="brand-mark">B</span>Bloggr</a>
      <ul class="nav-links">
        ${links.map(l =>
          `<li><a href="${l.href}" ${l.id ? `id="${l.id}"` : ""}
            class="${l.href === activeHref ? "active" : ""}">${l.label}</a></li>`
        ).join("")}
      </ul>
    </div>`;

  const logoutBtn = document.getElementById("nav-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await api("/api/auth/logout", { method: "POST" });
      _session = null;
      window.location.href = "/login.html";
    });
  }
}

function el(id) { return document.getElementById(id); }

function setHTML(id, html) {
  const e = el(id);
  if (e) e.innerHTML = html;
}

function setText(id, text) {
  const e = el(id);
  if (e) e.textContent = text;
}

function show(id) { const e = el(id); if (e) e.classList.remove("hidden"); }
function hide(id) { const e = el(id); if (e) e.classList.add("hidden"); }

function showAlert(id, msg, type = "error") {
  const e = el(id);
  if (!e) return;
  e.className = `alert alert-${type}`;
  e.textContent = msg;
  e.classList.remove("hidden");
}

function hideAlert(id) { hide(id); }


function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

/**
 * Human-friendly relative time: 'just now', '5 minutes ago', '2 days ago'.
 * Falls back to the absolute formatted date for anything older than a week.
 */
function timeAgo(iso) {
  if (!iso) return "";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;            // milliseconds
  const sec  = Math.floor(diff / 1000);
  const min  = Math.floor(sec  / 60);
  const hr   = Math.floor(min  / 60);
  const day  = Math.floor(hr   / 24);

  if (sec  <  60)  return "just now";
  if (min  <  60)  return min  === 1 ? "1 minute ago"  : `${min} minutes ago`;
  if (hr   <  24)  return hr   === 1 ? "1 hour ago"    : `${hr} hours ago`;
  if (day  <   7)  return day  === 1 ? "yesterday"     : `${day} days ago`;
  return fmtDate(iso);
}

function fmtTags(tags) {
  if (!tags || !tags.length) return "";
  return tags.map(t => `<a class="tag" href="/explore.html?tag=${encodeURIComponent(t)}">${escHtml(t)}</a>`).join(" ");
}


function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


function safeRenderContent(rawContent) {
  
  return rawContent
    .split(/\n{2,}/)
    .map(para => `<p>${escHtml(para.trim())}</p>`)
    .join("");
}


function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const c = el(containerId);
  if (!c || totalPages <= 1) { if (c) c.innerHTML = ""; return; }

  let html = "";
  html += `<button class="page-btn" ${currentPage <= 1 ? "disabled" : ""} data-p="${currentPage - 1}">‹ Prev</button>`;
  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === currentPage ? "current" : ""}" data-p="${p}">${p}</button>`;
  }
  html += `<button class="page-btn" ${currentPage >= totalPages ? "disabled" : ""} data-p="${currentPage + 1}">Next ›</button>`;
  c.innerHTML = html;
  c.querySelectorAll(".page-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => onPageChange(Number(btn.dataset.p)));
  });
}


function blogCardHTML(blog) {
  const date   = timeAgo(blog.publishedAt || blog.createdAt);
  const absDate = fmtDate(blog.publishedAt || blog.createdAt);
  const author = blog.author?.name || "Unknown";
  const tags   = fmtTags(blog.tags);
  const draftBadge = blog.status === "draft" ? `<span class="draft-badge">Draft</span>` : "";
  return `
    <div class="blog-card">
      <a class="blog-card-title" href="/post.html?id=${escHtml(blog._id)}">${escHtml(blog.title)}</a>
      ${draftBadge}
      <p class="blog-card-excerpt">${escHtml(blog.excerpt || "")}</p>
      <div class="blog-card-meta">
        <span>${escHtml(author)}</span>
        <span>·</span>
        <span title="${escHtml(absDate)}">${date}</span>
        ${tags ? `<span>·</span>${tags}` : ""}
      </div>
    </div>`;
}

window.Bloggr = {
  api, getSession, requireSession, requireAdmin,
  renderNav, el, setHTML, setText, show, hide,
  showAlert, hideAlert, fmtDate, timeAgo, fmtTags, escHtml,
  safeRenderContent, renderPagination, blogCardHTML
};
