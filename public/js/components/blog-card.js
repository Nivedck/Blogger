import { escHtml, fmtDate, fmtTags, timeAgo } from "../core/formatters.js";

export function blogCardHTML(blog) {
  const date = timeAgo(blog.publishedAt || blog.createdAt);
  const absoluteDate = fmtDate(blog.publishedAt || blog.createdAt);
  const author = blog.author?.name || "Unknown";
  const tags = fmtTags(blog.tags);
  const draftBadge = blog.status === "draft" ? '<span class="draft-badge">Draft</span>' : "";

  return `
    <div class="blog-card">
      <a class="blog-card-title" href="/post.html?id=${escHtml(blog._id)}">${escHtml(blog.title)}</a>
      ${draftBadge}
      <p class="blog-card-excerpt">${escHtml(blog.excerpt || "")}</p>
      <div class="blog-card-meta">
        <span>${escHtml(author)}</span>
        <span>·</span>
        <span title="${escHtml(absoluteDate)}">${date}</span>
        ${tags ? `<span>·</span>${tags}` : ""}
      </div>
    </div>`;
}

export function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" ${currentPage <= 1 ? "disabled" : ""} data-page="${currentPage - 1}">‹ Prev</button>`;
  for (let page = 1; page <= totalPages; page += 1) {
    html += `<button class="page-btn ${page === currentPage ? "current" : ""}" data-page="${page}">${page}</button>`;
  }
  html += `<button class="page-btn" ${currentPage >= totalPages ? "disabled" : ""} data-page="${currentPage + 1}">Next ›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn:not([disabled])").forEach(button => {
    button.addEventListener("click", () => onPageChange(Number(button.dataset.page)));
  });
}
