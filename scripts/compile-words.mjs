import fs from 'node:fs';

const scoreBySize = {
  4: 2,
  5: 4,
  6: 6,
  7: 12,
  8: 15,
  9: 18,
  10: 21,
  11: 24,
  12: 27,
  13: 30,
  14: 33,
  15: 36,
  16: 39,
  17: 42,
  18: 45,
  19: 48,
  20: 51,
  21: 54,
};

compile({
  inputFile: 'data/full-dictionary.txt',
  outputFile: 'data/compiled-188k.txt',
  filter: lines => {
    const disallowedText = fs.readFileSync('data/not-in-merriam.txt', 'utf8');
    const disallowedWords = disallowedText.trim().split(/[\r\n]+/);
    return lines.filter(word => !disallowedWords.includes(word));
  },
});
// compile({
//   inputFile: 'data/wiktionary-100k.txt',
//   outputFile: 'data/compiled-36k.txt',
//   filter: lines => {
//     const dictionaryText = fs.readFileSync('data/full-dictionary.txt', 'utf8');
//     const dictionaryWords = dictionaryText.trim().split(/[\r\n]+/);
//     return lines.filter(word => dictionaryWords.includes(word));
//   },
// });

function compile({ inputFile, outputFile, filter }) {
  const start = +new Date();
  console.log(
    `=====\nProcessing ${inputFile}. This may take 15 to 30 seconds.`
  );

  const text = fs.readFileSync(inputFile, 'utf8').trim();
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

  const tenOrMore = sevenOrFewer.filter(word => word.length >= 10);
  fs.writeFileSync('data/10-or-more.txt', tenOrMore.join('\n'), 'utf8');
  console.log(`${tenOrMore.length} were at least 10 letters long`);

  // run passed filter
  const filtered = filter(longEnough);

  const longest = filtered.reduce(
    (longest, word) => (word.length > longest ? word.length : longest),
    0
  );
  console.log(`Longest word is ${longest} letters long`);

  const scores = filtered.sort().map(scoreWord);

  const compiled = scores.join('\n');
  const sampleSize = 10;
  const rand = Math.floor(Math.random() * scores.length - sampleSize);
  const sampleLines = scores.slice(rand, rand + sampleSize);
  console.log(`-----\nSample:\n${sampleLines.join('\n')}\n----`);

  fs.writeFileSync(outputFile, compiled, 'utf8');

  const sizeInMB = (compiled.length / 1024 / 1024).toFixed(2);
  console.log(`Wrote to ${outputFile}: ${sizeInMB} MB`);

  const elapsed = +new Date() - start;
  console.log(`Finished in ${elapsed}ms`);

  // output letter frequencies
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const letterCounts = {};
  let buffer = text;
  let totalChars = buffer.length;
  for (const letter of alphabet) {
    buffer = buffer.replaceAll(letter, '');
    const count = totalChars - buffer.length;
    totalChars = buffer.length;
    letterCounts[letter] = count;
  }

  const sortable = [];
  for (const [letter, count] of Object.entries(letterCounts)) {
    sortable.push({ letter, count });
  }
  sortable.sort((a, b) => a.count - b.count);
  console.log('letter frequencies:');
  console.log(sortable);

  const likely = sortable.map(s => s.letter).join('');
  console.log(`Letters in descending frequency order: ${likely}`);
}

function scoreWord(word) {
  const sizeScore = scoreBySize[word.length];
  const letters = word.split('');
  const petals = new Set(letters);
  const pangramBonus = petals.size === 7 ? 7 : 0;
  const pangramSymbol = pangramBonus > 0 ? '+' : '';
  if (letters.length === petals.size) {
    const fixedScore = sizeScore + 5 + pangramBonus;
    return `${word}${fixedScore}${pangramSymbol}`;
  }
  const byLetter = {};
  for (const petal of petals) {
    const count = letters.filter(letter => letter === petal).length;
    byLetter[petal] = sizeScore + count * 5 + pangramBonus;
  }
  const byScore = {};
  for (const [letter, points] of Object.entries(byLetter)) {
    byScore[points] = byScore[points] || '';
    byScore[points] += letter;
  }
  let scoreStr = '';
  for (const [points, members] of Object.entries(byScore)) {
    scoreStr += `${points}${members}`;
  }
  return `${word}${scoreStr}${pangramSymbol}`;
}
