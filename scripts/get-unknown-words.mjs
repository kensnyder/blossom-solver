import fs from 'node:fs';

main();

function main() {
  const start = +new Date();
  const words = [];
  const htmlPath = '/Users/ksnyder/sandbox/merriam';
  const files = fs.readdirSync(htmlPath);
  for (const file of files) {
    const contents = fs.readFileSync(`/${htmlPath}/${file}`, 'utf8');
    const word = file.replace(/\.html$/, '');
    if (contents.trim() === '404') {
      words.push(word);
    }
  }
  const elapsed = +new Date() - start;
  console.log(
    `Found ${words.length} words absent from Merriam Webster in ${elapsed}ms`
  );
  fs.writeFileSync('data/not-in-merriam.txt', words.join('\n'), 'utf8');
}
