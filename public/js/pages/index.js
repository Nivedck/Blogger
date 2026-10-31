import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el } from "../core/dom.js";
import { escHtml, timeAgo } from "../core/formatters.js";
import { renderNav } from "../components/navigation.js";

async function loadFeaturedPost() {
  const { ok, data } = await api("/api/blogs?page=1");
  const blog = ok && data?.blogs?.[0];
  if (!blog) {
    el("featured-section")?.classList.add("hidden");
    return;
  }

  const author = escHtml(blog.author?.name || "A Bloggr writer");
  const date = timeAgo(blog.publishedAt || blog.createdAt);
  el("featured-post").innerHTML = `
    <div class="feature-copy">
      <span class="eyebrow">Featured reading</span>
      <h3><a href="/post.html?id=${escHtml(blog._id)}">${escHtml(blog.title)}</a></h3>
      <p>${escHtml(blog.excerpt || "A fresh perspective from the Bloggr community.")}</p>
      <p class="feature-meta">By ${author}${date ? ` · ${escHtml(date)}` : ""}</p>
    </div>
    <div class="feature-art" aria-hidden="true"></div>`;
}

async function init() {
  await renderNav();
  const user = await getSession();
  if (user) {
    el("hero-actions").innerHTML = `
      <a href="explore.html" class="btn btn-secondary">Explore stories</a>
      <a href="editor.html" class="btn btn-primary">Write something <span aria-hidden="true">→</span></a>`;
    el("cta-actions").innerHTML = `
      <a href="editor.html" class="btn btn-primary">Write a story <span aria-hidden="true">→</span></a>
      <a href="explore.html" class="btn btn-secondary">Keep exploring</a>`;
  }
  await loadFeaturedPost();
}

init();
