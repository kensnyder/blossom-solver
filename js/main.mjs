import { mapJoin, onSubmit, setHtml } from './domUtils.mjs';
import runBot from './runBot.mjs';

const dictionaries = {};
fetch('/data/compiled-level3.txt')
  .then(resp => resp.text())
  .then(text => (dictionaries.level3 = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

fetch('/data/compiled-level2.txt')
  .then(resp => resp.text())
  .then(text => (dictionaries.level2 = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

onSubmit('#InputForm', evt => {
  evt.preventDefault();
  const data = new FormData(evt.target);
  const inputLetters = data.get('petals');
  const inputCenterLetter = data.get('centerLetter');
  const letters = new Set((inputLetters + inputCenterLetter).split(''));
  if (letters.size !== 7) {
    alert('Please enter exactly 6 petal letters and 1 center letter');
    return;
  }
  if (!letters.has(inputCenterLetter)) {
    alert('Please enter the center letter');
    return;
  }
  renderResult(Array.from(letters).join(''), inputCenterLetter);
});

function renderResult(inputLetters, inputCenterLetter) {
  const best = runBot({
    label: 'Level 3',
    compiledDictionary: dictionaries.level3,
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqxzwkvfbyghmdpucltrsnoaie',
  });
  console.log(best);
  // prettier-ignore
  setHtml('#Output', `
    <h2>General stats</h2>
    <table>
      <tbody>
        <tr>
          <th>Total # Pangrams</th>
          <td>${best.totalPossiblePangrams}</td>
        </tr>
        <tr>
          <th>Total # Words</th>
          <td>${best.wordCount}</td>
        </tr>
      </tbody>
    </table>
    <h2>Bot result</h2>
    <table>
      <tbody>
        <tr>
          <th>Bot Score</th>
          <td>${best.totalScore}</td>
        </tr>
        <tr>
          <th>Average Score per Word</th>
          <td>${best.averageScore}</td>
        </tr>
        <tr>
          <th>Words used</th>
          <td>${mapJoin(best.wordsUsed, play => (`
            <span class="word-item word-plus-score ${play.pangram ? 'pangram' : ''}">
              <span class="petal">${play.petal}</span>
              <span class="word">${play.word}</span>
              <span class="score">${play.score}</span>
            </span>
          `))}</td>
        </tr>
      </tbody>
    </table>
    <h2>Top scores by petal</h2>
    <table>
      <tbody>
        <tr>
          <th colspan="6">Petal letter</th>
        </tr>
        <tr>
          ${mapJoin(best.scoresByPetal, petal => (`
            <th>${petal.petal}</th>
          `))}
        </tr>
        <tr>
          ${mapJoin(best.scoresByPetal, petal => (`
            <td>${mapJoin(petal.words.slice(0, 15), play => (`
              <span class="word-item word-plus-score ${play.pangram ? 'pangram' : ''}">
                <span class="word">${play.word}</span>
                <span class="score">${play.score}</span>
              </span>
            `))}</td>
          `))}
        </tr>
      </tbody>
      <h2>All possible words</h2>
      <div>
        ${mapJoin(best.allWords, word => (`
          <span class="word-item word-alone ${word.pangram ? 'pangram' : ''}">
            <span class="word">${word.word}</span>
          </span>
        `))}
      </div>
    </table>
  `);
}
