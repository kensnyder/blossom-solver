import fs from 'node:fs';
import rot13 from 'rot-13';

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
  outputFile: 'data/uncompiled-level3.txt',
  compiledFile: 'data/compiled-level3.txt',
  shouldWriteNumberFiles: true,
  filter: lines => {
    const disallowedWords = [
      ...loadWords('data/not-in-merriam.txt'),
      ...loadWords('data/medical-words.txt'),
      ...loadWords('data/proper-nouns.txt'),
      ...loadWordsRot13('data/swear-words.rot13.txt'),
    ];
    console.log('# disallowed words:', disallowedWords.length);
    return lines.filter(word => !disallowedWords.includes(word));
  },
});
compile({
  inputFile: 'data/wiktionary-100k.txt',
  outputFile: 'data/uncompiled-level2.txt',
  compiledFile: 'data/compiled-level2.txt',
  shouldWriteNumberFiles: false,
  filter: lines => {
    const dictionaryText = fs.readFileSync(
      'data/uncompiled-level3.txt',
      'utf8'
    );
    const dictionaryWords = dictionaryText.trim().split(/[\r\n]+/);
    return lines.filter(word => dictionaryWords.includes(word));
  },
});

function loadWords(path) {
  const text = fs.readFileSync(path, 'utf8');
  return text.trim().split(/[\r\n]+/);
}

function loadWordsRot13(path) {
  const text = fs.readFileSync(path, 'utf8');
  return rot13(text.trim()).split(/[\r\n]+/);
}

function compile({
  inputFile,
  outputFile,
  compiledFile,
  filter,
  shouldWriteNumberFiles,
}) {
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

  if (shouldWriteNumberFiles) {
    const tenOrMore = sevenOrFewer.filter(word => word.length >= 10);
    fs.writeFileSync('data/10-plus-letters.txt', tenOrMore.join('\n'), 'utf8');
    console.log(`${tenOrMore.length} were at least 10 letters long`);

    for (let size = 4; size <= 9; size++) {
      const found = sevenOrFewer.filter(word => word.length === size);
      fs.writeFileSync(`data/${size}-letters.txt`, found.join('\n'), 'utf8');
      console.log(`${found.length} were exactly ${size} letters long`);
    }
  }

  // run passed filter
  const filtered = filter(sevenOrFewer);
  console.log(
    `Filter function eliminated ${sevenOrFewer.length - filtered.length} words`
  );
  // write file containing words only
  fs.writeFileSync(outputFile, filtered.join('\n'), 'utf8');

  const longest = filtered.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    ''
  );
  console.log('Longest word is:', { word: longest, length: longest.length });

  const scores = filtered.sort().map(scoreWord);

  const compiled = scores.join('\n');
  const sampleSize = 10;
  const rand = Math.floor(Math.random() * scores.length - sampleSize);
  const sampleLines = scores.slice(rand, rand + sampleSize);
  console.log(`-----\nSample:\n${sampleLines.join('\n')}\n----`);

  fs.writeFileSync(compiledFile, compiled, 'utf8');

  const sizeInMB = (compiled.length / 1024 / 1024).toFixed(2);
  console.log(
    `Wrote ${scores.length} words to ${compiledFile}: ${sizeInMB} MB`
  );

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
  // console.log('letter frequencies:');
  // console.log(sortable);

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
