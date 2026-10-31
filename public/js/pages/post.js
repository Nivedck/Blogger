import { api } from "../core/api.js";
import { getSession } from "../core/auth.js";
import { el, hide, hideAlert, setHTML, setText, show, showAlert } from "../core/dom.js";
import { escHtml, fmtDate, fmtTags, safeRenderContent, timeAgo } from "../core/formatters.js";
import { renderNav } from "../components/navigation.js";

const blogId = new URLSearchParams(window.location.search).get("id");
let session = null;

function renderVotes(voteSummary) {
  setText("upvote-count", voteSummary.upvotes || 0);
  setText("downvote-count", voteSummary.downvotes || 0);
  el("upvote-btn").className = `vote-btn${voteSummary.userVote === 1 ? " active-up" : ""}`;
  el("downvote-btn").className = `vote-btn${voteSummary.userVote === -1 ? " active-down" : ""}`;
}

async function castVote(value) {
  if (!session) {
    window.location.href = "/login.html";
    return;
  }
  const { ok, data } = await api(`/api/votes/${blogId}`, { method: "POST", body: JSON.stringify({ value }) });
  if (ok) renderVotes(data);
}

async function deletePost() {
  if (!confirm("Delete this post and all its comments? This cannot be undone.")) return;
  const { ok } = await api(`/api/blogs/${blogId}`, { method: "DELETE" });
  if (ok) window.location.href = "/explore.html";
}

function commentHTML(comment) {
  const canDelete = session && (String(session._id) === String(comment.author?._id) || session.role === "admin");
  const replies = (comment.replies || []).map(commentHTML).join("");
  const replyButton = session && !comment.parentComment
    ? `<button class="btn btn-ghost btn-sm text-muted reply-toggle" data-id="${escHtml(comment._id)}">Reply</button>`
    : "";

  return `
    <div class="comment" id="comment-${escHtml(comment._id)}">
      <div class="comment-header">
        <span class="comment-author">${escHtml(comment.author?.name || "Unknown")}</span>
        <span class="text-muted" aria-hidden="true">·</span>
        <span class="comment-date" title="${escHtml(comment.createdAt)}">${timeAgo(comment.createdAt)}</span>
        ${canDelete ? `<button class="btn btn-ghost btn-sm text-danger delete-comment-btn" data-id="${escHtml(comment._id)}" style="margin-left:auto">Delete</button>` : ""}
      </div>
      <div class="comment-body">${escHtml(comment.content)}</div>
      <div style="margin-top:.3rem;display:flex;gap:.3rem">${replyButton}</div>
      ${replies ? `<div class="replies">${replies}</div>` : ""}
      <div class="reply-form" id="reply-form-${escHtml(comment._id)}">
        <div class="form-group mt-sm"><textarea class="reply-input" placeholder="Write a reply…" rows="2" maxlength="3000"></textarea></div>
        <div style="display:flex;gap:.4rem;justify-content:flex-end">
          <button class="btn btn-secondary btn-sm reply-cancel" data-id="${escHtml(comment._id)}">Cancel</button>
          <button class="btn btn-primary btn-sm reply-submit" data-id="${escHtml(comment._id)}">Reply</button>
        </div>
      </div>
    </div>`;
}

function attachCommentHandlers() {
  document.querySelectorAll(".delete-comment-btn").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm("Delete this comment?")) return;
      const { ok } = await api(`/api/comments/${blogId}/${button.dataset.id}`, { method: "DELETE" });
      if (ok) loadComments();
    });
  });
  document.querySelectorAll(".reply-toggle").forEach(button => {
    button.addEventListener("click", () => el(`reply-form-${button.dataset.id}`)?.classList.toggle("visible"));
  });
  document.querySelectorAll(".reply-cancel").forEach(button => {
    button.addEventListener("click", () => el(`reply-form-${button.dataset.id}`)?.classList.remove("visible"));
  });
  document.querySelectorAll(".reply-submit").forEach(button => {
    button.addEventListener("click", async () => {
      const form = el(`reply-form-${button.dataset.id}`);
      const content = form?.querySelector(".reply-input")?.value.trim();
      if (!content) return;
      const { ok } = await api(`/api/comments/${blogId}`, {
        method: "POST", body: JSON.stringify({ content, parentCommentId: button.dataset.id })
      });
      if (ok) loadComments();
    });
  });
}

async function loadComments() {
  const { ok, data } = await api(`/api/comments/${blogId}`);
  if (!ok) {
    setHTML("comments-list", '<p class="text-muted text-sm">Could not load comments.</p>');
    return;
  }

  const comments = data.comments || [];
  setText("comment-section-title", `Comments (${comments.length})`);
  if (!comments.length) {
    setHTML("comments-list", '<p class="text-muted text-sm">No comments yet. Be the first!</p>');
    return;
  }
  setHTML("comments-list", comments.map(commentHTML).join(""));
  attachCommentHandlers();
}

async function loadPost() {
  const { ok, data } = await api(`/api/blogs/${blogId}`);
  hide("loading");
  if (!ok) return show("error-state");

  const { blog, voteSummary } = data;
  document.title = `${blog.title} – Bloggr`;
  setText("post-title", blog.title);
  const authorName = blog.author?.name || "Unknown";
  const authorId = blog.author?._id;
  el("post-meta").innerHTML = `<a href="profile.html?id=${escHtml(authorId)}">${escHtml(authorName)}</a><span>·</span><span title="${escHtml(fmtDate(blog.publishedAt || blog.createdAt))}">${timeAgo(blog.publishedAt || blog.createdAt)}</span>`;
  el("tags-row").innerHTML = fmtTags(blog.tags);
  el("post-body").innerHTML = safeRenderContent(blog.content);
  renderVotes(voteSummary);

  if (session && (String(session._id) === String(blog.author?._id) || session.role === "admin")) {
    el("author-actions").innerHTML = `<a class="btn btn-secondary btn-sm" href="editor.html?id=${escHtml(blog._id)}">Edit</a><button class="btn btn-danger btn-sm" id="delete-btn">Delete</button>`;
    el("delete-btn").addEventListener("click", deletePost);
  }
  if (session && String(session._id) !== String(blog.author?._id)) show("report-row");

  show("post-content");
  show("comment-section");
  if (!session) setHTML("comment-form-wrap", '<p class="text-muted text-sm"><a href="login.html">Log in</a> to comment.</p>');
  await loadComments();
}

el("upvote-btn").addEventListener("click", () => castVote(1));
el("downvote-btn").addEventListener("click", () => castVote(-1));
el("report-btn").addEventListener("click", () => {
  show("report-modal");
  hide("report-alert");
  el("report-reason").value = "";
});
el("report-cancel").addEventListener("click", () => hide("report-modal"));
el("report-submit").addEventListener("click", async () => {
  hideAlert("report-alert");
  const reason = el("report-reason").value.trim();
  if (!reason) return showAlert("report-alert", "Please describe the issue");
  const { ok, data } = await api("/api/reports", {
    method: "POST", body: JSON.stringify({ targetType: "Blog", targetId: blogId, reason })
  });
  if (ok) {
    hide("report-modal");
    hide("report-row");
  } else {
    showAlert("report-alert", data?.message || "Could not submit report");
  }
});
el("comment-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  hideAlert("comment-alert");
  const content = el("comment-input").value.trim();
  if (!content) return;
  const { ok, data } = await api(`/api/comments/${blogId}`, { method: "POST", body: JSON.stringify({ content }) });
  if (ok) {
    el("comment-input").value = "";
    await loadComments();
  } else {
    showAlert("comment-alert", data?.message || "Could not post comment");
  }
});

async function init() {
  if (!blogId) {
    hide("loading");
    show("error-state");
    return;
  }
  await renderNav();
  session = await getSession();
  await loadPost();
}

init();
