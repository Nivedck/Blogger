export function escHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fmtDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

export function timeAgo(isoDate) {
  if (!isoDate) return "";

  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  return fmtDate(isoDate);
}

export function fmtTags(tags) {
  if (!tags?.length) return "";
  return tags.map(tag =>
    `<a class="tag" href="/explore.html?tag=${encodeURIComponent(tag)}">${escHtml(tag)}</a>`
  ).join(" ");
}

export function safeRenderContent(rawContent) {
  return rawContent
    .split(/\n{2,}/)
    .map(paragraph => `<p>${escHtml(paragraph.trim())}</p>`)
    .join("");
}
