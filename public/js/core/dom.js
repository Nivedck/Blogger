export function el(id) {
  return document.getElementById(id);
}

export function setHTML(id, html) {
  const element = el(id);
  if (element) element.innerHTML = html;
}

export function setText(id, text) {
  const element = el(id);
  if (element) element.textContent = text;
}

export function show(id) {
  const element = el(id);
  if (element) element.classList.remove("hidden");
}

export function hide(id) {
  const element = el(id);
  if (element) element.classList.add("hidden");
}

export function showAlert(id, message, type = "error") {
  const element = el(id);
  if (!element) return;

  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("hidden");
}

export function hideAlert(id) {
  hide(id);
}
