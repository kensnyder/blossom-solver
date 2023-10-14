import fs from 'node:fs';
import runBot from '../js/runBot.mjs';

main();

function main() {
  const inputLetters = process.argv[2] || 'majesty';
  const inputCenterLetter = process.argv[3] || 's';
  const level3 = runBot({
    label: 'Level 3 Bot',
    compiledDictionary: fs.readFileSync('data/compiled-level3.txt', 'utf8'),
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqxzwkvfbyghmdpucltrsnoaie',
  });
  console.log(level3);
  const level2 = runBot({
    label: 'Level 2 Bot',
    compiledDictionary: fs.readFileSync('data/compiled-level2.txt', 'utf8'),
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqzxwkvfybphgmcudlotrsnaie',
  });
  console.log(level2);
}
