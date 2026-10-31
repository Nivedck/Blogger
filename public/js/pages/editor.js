import { api } from "../core/api.js";
import { requireSession } from "../core/auth.js";
import { el, hideAlert, showAlert } from "../core/dom.js";
import { fmtDate } from "../core/formatters.js";
import { renderNav } from "../components/navigation.js";

const params = new URLSearchParams(window.location.search);
let editId = params.get("id");

function parseTags(rawTags) {
  return rawTags.split(",").map(tag => tag.trim().toLowerCase()).filter(Boolean);
}

async function loadExistingPost() {
  const { ok, data } = await api(`/api/blogs/${editId}`);
  if (!ok) {
    showAlert("alert", "Post not found");
    return;
  }

  const { blog } = data;
  document.title = `Edit: ${blog.title} – Bloggr`;
  el("title-input").value = blog.title;
  el("content-input").value = blog.content;
  el("tags-input").value = (blog.tags || []).join(", ");
  el("status-row").textContent = `Status: ${blog.status}  ·  Last saved: ${fmtDate(blog.updatedAt)}`;
  el("delete-btn").classList.remove("hidden");
}

async function save(status) {
  hideAlert("alert");
  hideAlert("success-alert");

  const title = el("title-input").value.trim();
  const content = el("content-input").value.trim();
  const tags = parseTags(el("tags-input").value);
  if (!title) return showAlert("alert", "Title is required");
  if (!content) return showAlert("alert", "Content is required");

  const body = JSON.stringify({ title, content, tags, status });
  const response = editId
    ? await api(`/api/blogs/${editId}`, { method: "PUT", body })
    : await api("/api/blogs", { method: "POST", body });

  if (!response.ok) {
    showAlert("alert", response.data?.message || "Could not save post");
    return;
  }

  const { blog } = response.data;
  el("success-alert").textContent = status === "published" ? "Published!" : "Draft saved!";
  el("success-alert").classList.remove("hidden");
  el("status-row").textContent = `Status: ${blog.status}  ·  Last saved: ${fmtDate(blog.updatedAt)}`;

  if (status === "published") {
    setTimeout(() => { window.location.href = `/post.html?id=${blog._id}`; }, 800);
  } else if (!editId) {
    editId = blog._id;
    history.replaceState({}, "", `editor.html?id=${editId}`);
    el("delete-btn").classList.remove("hidden");
  }
}

el("save-draft-btn").addEventListener("click", () => save("draft"));
el("publish-btn").addEventListener("click", () => save("published"));
el("delete-btn").addEventListener("click", async () => {
  if (!editId || !confirm("Delete this post permanently?")) return;
  const { ok } = await api(`/api/blogs/${editId}`, { method: "DELETE" });
  if (ok) window.location.href = "/explore.html";
});

async function init() {
  if (!await requireSession("/login.html")) return;
  await renderNav("/editor.html");
  if (editId) await loadExistingPost();
  else document.title = "New post – Bloggr";
}

init();
