import { api } from "../core/api.js";
import { requireAdmin } from "../core/auth.js";
import { el, setHTML } from "../core/dom.js";
import { escHtml, fmtDate } from "../core/formatters.js";
import { renderPagination } from "../components/blog-card.js";
import { renderNav } from "../components/navigation.js";

let reportsPage = 1;
let usersPage = 1;

function reportRowHTML(report) {
  return `
    <div class="report-row" id="report-${escHtml(report._id)}">
      <div class="report-target">${escHtml(report.targetType)}: target ID ${escHtml(String(report.target))}</div>
      <div class="report-reason">"${escHtml(report.reason)}"</div>
      <div class="report-meta">Reported by ${escHtml(report.reporter?.name || "?")} · ${fmtDate(report.createdAt)} · Status: <strong>${escHtml(report.status)}</strong></div>
      ${report.status === "pending" ? `<div style="display:flex;gap:.4rem;margin-top:.4rem">
        <button class="btn btn-secondary btn-sm" data-status="resolved" data-id="${escHtml(report._id)}">Resolve</button>
        <button class="btn btn-ghost btn-sm" data-status="rejected" data-id="${escHtml(report._id)}">Reject</button>
        <button class="btn btn-ghost btn-sm" data-status="reviewed" data-id="${escHtml(report._id)}">Mark reviewed</button>
      </div>` : ""}
    </div>`;
}

function attachReportHandlers() {
  document.querySelectorAll("[data-status]").forEach(button => {
    button.addEventListener("click", async () => {
      const { ok } = await api(`/api/reports/${button.dataset.id}/status`, {
        method: "PATCH", body: JSON.stringify({ status: button.dataset.status })
      });
      if (ok) loadReports(reportsPage);
    });
  });
}

async function loadReports(page = reportsPage) {
  reportsPage = page;
  setHTML("reports-list", '<div class="loading-row"><span class="spinner"></span> Loading…</div>');
  const query = new URLSearchParams({ page, status: el("status-filter").value });
  const { ok, data } = await api(`/api/reports?${query}`);
  if (!ok) return setHTML("reports-list", '<p class="text-muted text-sm">Failed to load reports.</p>');
  if (!data.reports.length) {
    setHTML("reports-list", '<div class="empty-state"><p>No reports found.</p></div>');
    setHTML("reports-pagination", "");
    return;
  }
  setHTML("reports-list", data.reports.map(reportRowHTML).join(""));
  attachReportHandlers();
  renderPagination("reports-pagination", reportsPage, data.totalPages, loadReports);
}

async function loadUsers(page = usersPage) {
  usersPage = page;
  setHTML("users-list", '<div class="loading-row"><span class="spinner"></span> Loading…</div>');
  const { ok, data } = await api(`/api/users?page=${page}`);
  if (!ok) return setHTML("users-list", '<p class="text-muted text-sm">Failed to load users.</p>');
  if (!data.users.length) return setHTML("users-list", '<div class="empty-state"><p>No users found.</p></div>');
  setHTML("users-list", data.users.map(user => `
    <div class="report-row">
      <div class="report-target"><a href="profile.html?id=${escHtml(user._id)}">${escHtml(user.name)}</a>${user.role === "admin" ? '<span class="draft-badge" style="background:#dbeafe;border-color:#93c5fd;color:#1e40af">Admin</span>' : ""}</div>
      <div class="report-reason">${escHtml(user.email)}</div>
      <div class="report-meta">Joined ${fmtDate(user.createdAt)}</div>
    </div>`).join(""));
  renderPagination("users-pagination", usersPage, data.totalPages, loadUsers);
}

document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", async () => {
    document.querySelectorAll(".admin-tab").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    const isReports = tab.dataset.tab === "reports";
    el("tab-reports").classList.toggle("hidden", !isReports);
    el("tab-users").classList.toggle("hidden", isReports);
    if (!isReports) await loadUsers();
  });
});
el("status-filter").addEventListener("change", () => loadReports(1));
el("refresh-reports-btn").addEventListener("click", () => loadReports(1));

async function init() {
  if (!await requireAdmin("/explore.html")) return;
  await renderNav("/admin.html");
  await loadReports();
}

init();
