import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el, setHTML } from "../core/dom.js";
import { escHtml } from "../core/formatters.js";
import { blogCardHTML, renderPagination } from "../components/blog-card.js";
import { renderNav } from "../components/navigation.js";

let currentPage = 1;
let currentTag = "";
let currentSearch = "";

const params = new URLSearchParams(window.location.search);
currentTag = params.get("tag") || "";
currentSearch = params.get("search") || "";
currentPage = Number(params.get("page")) || 1;
if (currentSearch) el("search-input").value = currentSearch;

async function loadBlogs(page = currentPage) {
  currentPage = page;
  setHTML("blog-list", '<div class="loading-row"><span class="spinner"></span> Loading…</div>');
  setHTML("pagination", "");

  const query = new URLSearchParams({ page: currentPage, search: currentSearch, tag: currentTag });
  const { ok, data } = await api(`/api/blogs?${query}`);
  if (!ok) {
    setHTML("blog-list", '<div class="empty-state"><p>Failed to load posts.</p></div>');
    return;
  }

  if (!data.blogs?.length) {
    setHTML("blog-list", `<div class="empty-state"><p>No posts found.</p>${currentTag || currentSearch ? '<p><a href="explore.html">Clear filters</a></p>' : ""}</div>`);
    return;
  }

  setHTML("blog-list", `<div class="blog-list">${data.blogs.map(blogCardHTML).join("")}</div>`);
  renderPagination("pagination", currentPage, data.totalPages, loadBlogs);
}

async function loadPopularTags() {
  const { ok, data } = await api("/api/blogs?page=1");
  if (!ok || !data.blogs) return;

  const tagCount = {};
  data.blogs.forEach(blog => (blog.tags || []).forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1; }));
  const tags = Object.entries(tagCount).sort((first, second) => second[1] - first[1]).slice(0, 10);
  setHTML("popular-tags", tags.length
    ? tags.map(([tag]) => `<a class="tag" href="explore.html?tag=${encodeURIComponent(tag)}">${escHtml(tag)}</a>`).join("")
    : '<span class="text-muted text-sm">No tags yet</span>');
}

function updateTagStrip() {
  const strip = el("tag-filter-strip");
  strip.innerHTML = currentTag
    ? `<span class="text-sm text-muted">Filtering by tag:</span><a class="tag" href="explore.html">${escHtml(currentTag)} ✕</a>`
    : "";
}

el("search-btn").addEventListener("click", () => {
  currentSearch = el("search-input").value.trim();
  loadBlogs(1);
});
el("search-input").addEventListener("keydown", event => {
  if (event.key === "Enter") el("search-btn").click();
});

async function init() {
  await renderNav("/explore.html");
  if (await getSession()) el("write-cta").style.display = "block";
  await Promise.all([loadBlogs(), loadPopularTags()]);
  updateTagStrip();
}

init();
