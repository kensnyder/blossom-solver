import fs from 'node:fs';
import runBot from '../js/runBot.mjs';

main();

function main() {
  const inputLetters = process.argv[2] || 'majesty';
  const inputCenterLetter = process.argv[3] || 's';
  const best188 = runBot({
    label: '188k-bot',
    compiledDictionary: fs.readFileSync('data/compiled-188k.txt', 'utf8'),
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqxzwkvfbyghmdpucltrsnoaie',
  });
  console.log(best188);
  const best36 = runBot({
    label: '36k-bot',
    compiledDictionary: fs.readFileSync('data/compiled-36k.txt', 'utf8'),
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqzxwkvfybphgmcudlotrsnaie',
  });
  console.log(best36);
}
