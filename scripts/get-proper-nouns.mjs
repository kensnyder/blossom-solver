import fs from 'node:fs';

main();

function main() {
  const start = +new Date();
  const nouns = [];
  const htmlPath = '/Users/ksnyder/sandbox/merriam';
  const files = fs.readdirSync(htmlPath);
  for (const file of files) {
    const contents = fs.readFileSync(`/${htmlPath}/${file}`, 'utf8');
    const word = file.replace(/\.html$/, '');
    if (contents.match(/<h1[^>]*>[A-Z]/)) {
      nouns.push(word);
    }
  }
  const elapsed = +new Date() - start;
  console.log(`Found ${nouns.length} nouns in ${elapsed}ms`);
  fs.writeFileSync('data/proper-nouns.txt', nouns.join('\n'), 'utf8');
}
