export default function runBot({
  label,
  compiledDictionary,
  inputLetters,
  inputCenterLetter,
  frequencyOrder,
}) {
  const start = +new Date();

  const sorted = inputLetters.split('').sort((a, b) => {
    return frequencyOrder.indexOf(a) - frequencyOrder.indexOf(b);
  });
  const letters = sorted.join('');

  const matched = compiledDictionary.match(
    new RegExp(`^[${letters}]+[0-9].*$`, 'gm')
  );

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

  const best = {
    label,
    letters: inputLetters,
    centerLetter: inputCenterLetter,
    totalPossibleWords: matched.length,
    totalPossiblePangrams: expanded.filter(w => w.pangram).length,
    maxScore: 0,
    pangramCount: 0,
    averageScore: 0,
    elapsed: 0,
    words: [],
  };
  const used = [];
  for (const letter of letters) {
    if (letter === inputCenterLetter) {
      // center letter is not a petal
      continue;
    }
    const sorted = expanded
      .filter(data => data[letter])
      .sort((a, b) => b[letter] - a[letter]);
    let foundTop = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (used.includes(sorted[i].word)) {
        // skip a word that was already used
        continue;
      }
      if (!sorted[i].word.includes(inputCenterLetter)) {
        // invalid word: does not contain center letter
        continue;
      }
      // collect the word
      best.words.push({
        word: sorted[i].word,
        // length: sorted[i].word.length,
        petal: letter,
        score: sorted[i][letter],
        pangram: sorted[i].pangram,
      });
      best.maxScore += sorted[i][letter];
      if (sorted[i].pangram) {
        best.pangramCount++;
      }
      // note that we used the word
      used.push(sorted[i].word);
      foundTop++;
      if (foundTop === 2) {
        // we already have two words for this petal
        break;
      }
    }
  }

  best.averageScore = Math.floor(best.maxScore / best.words.length);
  best.took = +new Date() - start;

  return best;
}
