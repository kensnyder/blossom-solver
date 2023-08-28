export function qs(selector) {
  return element.querySelector(selector);
}

export function qsa(selector) {
  return [...element.querySelectorAll(selector)];
}

export function setHtml(selector, html) {
  qs(selector).innerHTML = html;
}

export function setHtmlByIds(contentById) {
  for (const [id, html] of Object.entries(contentById)) {
    document.getElementById(id).innerHTML = html;
  }
}

export function show(selector) {
  qs(selector).style.display = '';
}

export function hide(selector) {
  qs(selector).style.display = 'none';
}

export function onSubmit(selector, fn) {
  qs(selector).addEventListener('submit', fn);
}

export function onClick(selector, fn) {
  qs(selector).addEventListener('click', fn);
}
