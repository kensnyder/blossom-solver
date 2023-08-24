import fs from 'node:fs';

main();

function main() {
  const base = '/tmp/merriam';
  const files = fs.readdirSync(base);
  for (const file of files) {
    const html = fs.readFileSync(`${base}/${file}`, 'utf8');
    if (html === '404') {
      console.log(`404: ${file}`);
      fs.writeFileSync(`data/merriam/${file}`, '404', 'utf8');
      continue;
    }
    const match = html.match(/<h1[^>]*>(.+?)<\/h1>/);
    if (match) {
      console.log(match[1]);
      fs.writeFileSync(`data/merriam/${file}`, match[0], 'utf8');
    } else {
      console.error(`No h1 found in ${file}`);
    }
    break;
  }
}
