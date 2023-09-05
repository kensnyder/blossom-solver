import fs from 'node:fs';

main();

function main() {
  const text = fs.readFileSync('data/wiktionary-100k.txt', 'utf8');
  const allLines = text.split(/[\r\n]+/);
  const wordLines = allLines.filter(line => line.match(/^[a-z]+$/));
  const words = [...new Set(wordLines)];
  console.log(`Found ${words.length} words`);
  const minLength = 4;
  const longEnough = words.filter(word => word.length >= minLength);
  console.log(`${longEnough.length} were at least ${minLength} letters long`);
  const sevenOrFewer = longEnough.filter(
    word => new Set(word.split('')).size <= 7
  );
  console.log(`${sevenOrFewer.length} had 7 or fewer distinct letters`);

  fs.writeFileSync(
    'data/uncompiled-wiktionary.txt',
    sevenOrFewer.join('\n'),
    'utf8'
  );
  console.log('Wrote to uncompiled-wiktionary.txt');
}
