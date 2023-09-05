import fs from 'node:fs';

main().then(console.log, console.error);

async function main() {
  const start = +new Date();
  const compiled36k = ''; //fs.readFileSync('data/compiled-36k.txt', 'utf8');
  const destPath = '/Users/ksnyder/sandbox/merriam';
  const largeWords = fs.readFileSync('data/uncompiled-wiktionary.txt', 'utf8');
  const largeWordList = largeWords.trim().split('\n');
  let i = 0;
  let counts = {
    is404: 0,
    in36k: 0,
    found: 0,
    alreadyChecked: 0,
  };
  while (largeWordList.length > 0) {
    i++;
    const idx = String(i).padStart(5, '0');
    const word = largeWordList.splice(rand(0, largeWordList.length - 1), 1);
    if (fs.existsSync(`${destPath}/${word}.html`)) {
      console.log(`${idx} [${word}] ----- Already checked -----`);
      counts.alreadyChecked++;
      continue;
    }
    if (new RegExp(`^${word}\\d`, 'm').test(compiled36k)) {
      fs.writeFileSync(`${destPath}/${word}.html`, 'in 36k\n\n', 'utf8');
      console.log(`${idx} [${word}] ----- Found in 36k -----`);
      counts.in36k++;
      continue;
    }
    let resp, errorMessage;
    try {
      resp = await fetch(`https://www.merriam-webster.com/dictionary/${word}`);
    } catch (err) {
      errorMessage = err.message;
    }
    if (
      /timeout|epipe/i.test(errorMessage) ||
      [504, 502].includes(resp?.status)
    ) {
      largeWordList.push(word);
      console.log(
        `${idx} [${word}] Timeout - Will retry in 1 hour from ${new Date()}`
      );
      await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000));
      continue;
    } else if (resp?.ok) {
      const html = await resp.text();
      const lines = [];
      extract(lines, html, /(<h1[^>]*>.+?<\/h1>)/s);
      extract(lines, html, /(<title[^>]*>.+?<\/title>)/s);
      extract(lines, html, /(<meta name="description"[^>]+?>)/s);
      extract(lines, html, /(<link rel="canonical"[^>]+?>)/s);
      const extracted = lines.join('\n') + '\n\n';
      fs.writeFileSync(`${destPath}/${word}.html`, extracted, 'utf8');
      console.log(`${idx} [${word}] Wrote ${destPath}/${word}.html`);
      counts.found++;
    } else if (resp?.status === 404) {
      console.log(`${idx} [${word}] Not found`);
      fs.writeFileSync(`${destPath}/${word}.html`, '404\n\n', 'utf8');
    } else {
      console.log(
        `${idx} [${word}] Fetch error: ${resp.status} ${resp.statusText} **********************************`
      );
      break;
    }
    if (i === 25000) {
      break;
    }
    let waitFor = rand(1500, 2500);
    if (i % 1000 === 0) {
      waitFor = 2 * 60 * 1000;
    } else if (i % 50 === 0) {
      waitFor = 10 * 1000;
    }
    await new Promise(resolve => setTimeout(resolve, waitFor));
  }
  const elapsed = Math.ceil((+new Date() - start) / 1000).toLocaleString();
  console.log(`DONE at ${new Date()}`);
  console.log(`Elapsed: ${elapsed} seconds`);
  console.log('counts:\n', counts);
  process.exit(0);
}

function extract(stack, html, regexp) {
  const match = html.match(regexp);
  if (match) {
    stack.push(match[1]);
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
