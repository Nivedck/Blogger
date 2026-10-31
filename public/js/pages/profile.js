import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el, hide, hideAlert, setHTML, setText, show, showAlert } from "../core/dom.js";
import { blogCardHTML } from "../components/blog-card.js";
import { fmtDate } from "../core/formatters.js";
import { renderNav } from "../components/navigation.js";

const profileId = new URLSearchParams(window.location.search).get("id");
let session = null;

async function loadProfile() {
  const { ok, data } = await api(`/api/users/${profileId}`);
  hide("loading");
  if (!ok) return show("error-state");

  const { user, blogs } = data;
  document.title = `${user.name} – Bloggr`;
  setText("avatar-letter", user.name.charAt(0).toUpperCase());
  setText("profile-name", user.name);
  el("profile-bio").textContent = user.bio || "";
  setText("profile-joined", `Member since ${fmtDate(user.createdAt)}`);

  const isSelf = session && String(session._id) === String(user._id);
  if (isSelf) {
    show("edit-section");
    el("edit-name").value = user.name;
    el("edit-bio").value = user.bio || "";
  }

  setText("posts-heading", `${isSelf ? "Your posts" : `Posts by ${user.name}`} (${blogs.length})`);
  setHTML("posts-list", blogs.length
    ? `<div class="blog-list">${blogs.map(blogCardHTML).join("")}</div>`
    : `<div class="empty-state"><p>No posts yet.</p>${isSelf ? '<a href="editor.html" class="btn btn-primary btn-sm mt-sm">Write your first post</a>' : ""}</div>`);
  show("profile-content");
}

el("save-profile-btn")?.addEventListener("click", async () => {
  hideAlert("profile-alert");
  hideAlert("profile-success");
  const name = el("edit-name").value.trim();
  const bio = el("edit-bio").value.trim();
  if (!name) return showAlert("profile-alert", "Name cannot be empty");

  const { ok, data } = await api(`/api/users/${profileId}`, { method: "PATCH", body: JSON.stringify({ name, bio }) });
  if (!ok) return showAlert("profile-alert", data?.message || "Could not save");

  el("profile-success").textContent = "Profile updated!";
  el("profile-success").classList.remove("hidden");
  setText("profile-name", data.user.name);
  setText("avatar-letter", data.user.name.charAt(0).toUpperCase());
});

el("delete-account-btn")?.addEventListener("click", async () => {
  if (!confirm("Delete your account permanently? All your posts and comments will be removed.")) return;
  const { ok } = await api(`/api/users/${profileId}`, { method: "DELETE" });
  if (ok) window.location.href = "/login.html";
});

async function init() {
  if (!profileId) {
    hide("loading");
    show("error-state");
    return;
  }
  await renderNav();
  session = await getSession();
  await loadProfile();
}

init();
