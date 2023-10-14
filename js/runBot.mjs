export default function runBot({
  label,
  compiledDictionary,
  inputLetters,
  inputCenterLetter,
  frequencyOrder,
}) {
  const start = +new Date();

  const letters = inputLetters.split('');

  const matched = compiledDictionary.match(
    new RegExp(`^[${letters}]+[0-9].*$`, 'gm')
  );

  if (!matched) {
    return {
      error: 'No words found',
    };
  }

  const expanded = matched.map(line => {
    let pangram = false;
    if (line.endsWith('+')) {
      pangram = true;
      line = line.slice(0, -1);
    }
    const parts = line.split(/([0-9]+)/);
    if (parts[parts.length - 1] === '') {
      parts.pop();
    }
    const data = { line, word: parts.shift(), pangram };
    if (parts.length === 1) {
      parts.push(data.word);
    }
    for (let i = 0; i < parts.length; i += 2) {
      const members = parts[i + 1].split('');
      for (const member of members) {
        data[member] = parseInt(parts[i]);
      }
    }
    return data;
  });

  const allWords = expanded.filter(w => w.word.includes(inputCenterLetter));

  const best = {
    label,
    letters: inputLetters,
    centerLetter: inputCenterLetter,
    totalPossibleWords: matched.length,
    totalPossiblePangrams: expanded.filter(w => w.pangram).length,
    totalScore: 0,
    pangramCount: 0,
    averageScore: 0,
    elapsed: 0,
    wordsUsed: [],
    allWords: allWords.map(w => ({ word: w.word, pangram: w.pangram })),
    scoresByPetal: [],
    wordCount: allWords.length,
  };

  const allScores = [];
  const usedByPetal = {};
  for (const letter of letters) {
    if (letter === inputCenterLetter) {
      // center letter is not a petal
      continue;
    }
    const sorted = allWords
      .filter(data => data[letter])
      .sort((a, b) => b[letter] - a[letter]);
    const words = sorted.map(item => ({
      petal: letter,
      word: item.word,
      score: item[letter],
      pangram: item.pangram,
    }));
    allScores.push(...words);
    best.scoresByPetal.push({
      petal: letter,
      words,
    });
    usedByPetal[letter] = 0;
  }

  allScores.sort((a, b) => {
    // sort by score descending and then by frequency order
    return (
      b.score - a.score || frequencyOrder.indexOf(a) - frequencyOrder.indexOf(b)
    );
  });
  const used = [];
  while (best.wordsUsed.length < 12) {
    if (allScores.length === 0) {
      // we don't even have 12 words total?
      // those must be some bad letters
      break;
    }
    const word = allScores.shift();
    const letter = word.petal;
    if (usedByPetal[letter] === 2) {
      // already have two words for this petal
      continue;
    }
    if (used.includes(word.word)) {
      // skip a word that was already used
      continue;
    }
    usedByPetal[letter]++;
    used.push(word.word);
    // collect the word
    best.wordsUsed.push(word);
    best.totalScore += word.score;
    if (word.pangram) {
      best.pangramCount++;
    }
  }

  if (used.length === 0) {
    return {
      error: 'No words found',
    };
  }

  // sort the used list back into the letter order the user entered
  best.wordsUsed.sort((a, b) => {
    return letters.indexOf(a.petal) - letters.indexOf(b.petal);
  });

  best.averageScore = Math.floor(best.totalScore / best.wordsUsed.length);
  best.took = +new Date() - start;

  return best;
}
