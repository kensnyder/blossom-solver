import { mapJoin, onChange, onSubmit, setHtml } from './domUtils.mjs';
import runBot from './runBot.mjs';

const dictionaries = {};
fetch('/data/compiled-level3.txt')
  .then(resp => resp.text())
  .then(text => (dictionaries.Expert = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

fetch('/data/compiled-level2.txt')
  .then(resp => resp.text())
  .then(text => (dictionaries.Intermediate = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

const frequencies = {
  Expert: 'jqxzwkvfbyghmdpucltrsnoaie',
  Intermediate: 'jqzxwkvfybphgmcudlotrsnaie',
};

renderForm();

function renderForm() {
  // prettier-ignore
  setHtml('#FormArea', `
    <form id="InputForm">
      <label>
        <span class="label-text">Enter the 6 petal letters</span>
        <input type="text" name="petals" size="8" placeholder="" />
      </label>
      <label>
        <span class="label-text">Enter the center letter</span>
        <input type="text" name="center" size="2" placeholder="" />
      </label>
      <label>
        <span class="label-text">Select difficulty</span>
        <select name="difficulty">
          <option value="Expert">Level 3 - Expert</option>
          <option value="Intermediate" selected="selected">Level 2 - Intermediate</option>
          <!--<option value="Beginner">Level 1 - Beginner</option>-->
        </select>
      </label>
      <button type="submit">Solve</button>
    </form>
  `);
  setHtml('#Output', '');
  onChange('#InputForm select', () => {
    setHtml('#Output', '');
  });
  onSubmit('#InputForm', evt => {
    evt.preventDefault();
    const data = Object.fromEntries(new FormData(evt.target));
    const letters = new Set((data.petals + data.center).split(''));
    console.log('letters', [...letters]);
    if (letters.size !== 7) {
      alert('Please enter exactly 6 petal letters and 1 center letter');
      return;
    }
    if (!letters.has(data.center)) {
      alert('Please enter the center letter');
      return;
    }
    renderResult(Array.from(letters).join(''), data.center, data.difficulty);
  });
}

function renderResult(inputLetters, inputCenterLetter, difficulty) {
  const best = runBot({
    label: difficulty,
    compiledDictionary: dictionaries[difficulty],
    inputLetters,
    inputCenterLetter,
    frequencyOrder: frequencies[difficulty],
  });
  console.log(best);
  // prettier-ignore
  setHtml('#Output', `
    <h2>${difficulty} Bot Result: ${best.totalScore} points</h2>
    <table class="key-value-table">
      <tbody>
        <tr>
          <th>Total Pangrams Found</th>
          <td>${best.totalPossiblePangrams}</td>
        </tr>
        <tr>
          <th>Total Pangrams Used</th>
          <td>${best.pangramCount}</td>
        </tr>        
        <tr>
          <th>Total Words Found</th>
          <td>${best.wordCount}</td>
        </tr>
        <tr>
          <th>Bot Score</th>
          <td>${best.totalScore}</td>
        </tr>
        <tr>
          <th>Average Score Per Word</th>
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
    <table class="petals-table">
      <tbody>
        <tr>
          <th colspan="6">Petal letter</th>
        </tr>
        <tr>
          ${mapJoin(best.scoresByPetal, petal => (`
            <th class="petal-column-label">${petal.petal}</th>
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
    </table>
    <h2>All Words Found</h2>
    <div class="all-words">
      ${mapJoin(best.allWords, word => (`
        <span class="word-item word-alone ${word.pangram ? 'pangram' : ''}">
          <span class="word">${word.word}</span>
        </span>
      `))}
    </div>
  `);
}
