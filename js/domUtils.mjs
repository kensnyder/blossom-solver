export function qs(selector) {
  return document.querySelector(selector);
}

export function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

export function setHtml(selector, html) {
  qs(selector).innerHTML = html;
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

export function mapJoin(array, mapper) {
  return array.map(mapper).join('');
}
