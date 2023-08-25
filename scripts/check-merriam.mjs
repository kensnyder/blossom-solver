import fs from 'node:fs';

main().then(console.log, console.error);

async function main() {
  const largeWords = fs.readFileSync('data/10-or-more.txt', 'utf8');
  const largeWordList = largeWords.trim().split('\n');
  let i = 0;
  while (largeWordList.length > 0) {
    i++;
    const idx = String(i).padStart(5, '0');
    const word = largeWordList.splice(rand(0, largeWordList.length - 1), 1);
    if (fs.existsSync(`/tmp/merriam/${word}.html`)) {
      console.log(`${idx} [${word}] ----- Already checked -----`);
      continue;
    }
    const resp = await fetch(
      `https://www.merriam-webster.com/dictionary/${word}`
    );
    if (resp.ok) {
      const text = await resp.text();
      fs.writeFileSync(`/tmp/merriam/${word}.html`, text, 'utf8');
      console.log(`${idx} [${word}] Wrote /tmp/merriam/${word}.html`);
    } else if (resp.status === 404) {
      console.log(`${idx} [${word}] Not found`);
      fs.writeFileSync(`/tmp/merriam/${word}.html`, '404', 'utf8');
    } else {
      console.log(
        `${idx} [${word}] Error fetching: ${resp.status} ${resp.statusText}`
      );
      break;
    }
    if (i === 25000) {
      break;
    }
    let waitFor = rand(2000, 4000);
    if (i % 1000 === 0) {
      waitFor = 3 * 60 * 1000;
    } else if (i % 50 === 0) {
      waitFor = 30 * 1000;
    }
    await new Promise(resolve => setTimeout(resolve, waitFor));
  }
  console.log(`DONE at ${new Date()}`);
  process.exit(0);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
