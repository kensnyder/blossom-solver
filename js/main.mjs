import { mapJoin, onChange, onSubmit, qs, setHtml } from './domUtils.mjs';
import runBot from './runBot.mjs';

const dictionaries = {};
fetch('data/compiled-level3.txt')
  .then(resp => resp.text())
  .then(text => (dictionaries.Expert = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

fetch('data/compiled-level2.txt')
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
        <input class="form-control" type="text" name="petals" size="8" placeholder="" />
      </label>
      <label>
        <span class="label-text">Enter the center letter</span>
        <input class="form-control" type="text" name="center" size="2" placeholder="" />
      </label>
      <label>
        <span class="label-text">Select difficulty</span>
        <select class="form-select" name="difficulty">
          <option value="Expert">Level 3 - Expert</option>
          <option value="Intermediate" selected="selected">Level 2 - Intermediate</option>
          <!--<option value="Beginner">Level 1 - Beginner</option>-->
        </select>
      </label>
      <label>
        <span class="label-text">Select Hints Mode</span>
        <select class="form-select" name="mode">
          <option value="hints-1">Hints level 1</option>
          <option value="hints-2">Hints level 2</option>
          <option value="hints-3">Hints level 3</option>
          <option value="solution" selected="selected">Show full solution</option>
          <!--<option value="Beginner">Level 1 - Beginner</option>-->
        </select>
      </label>
      <div class="button-area">
      <button class="btn btn-primary" type="submit">Solve</button>
      </div>
    </form>
  `);
  if (qs('#Output').innerHTML === '') {
    const query = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(query)) {
      qs(`#InputForm [name=${key}]`).value = value;
    }
  }
  const resubmit = evt => {
    if (qs('#Output').innerHTML === '') {
      return;
    }
    setTimeout(() => run(evt.target.form), 15);
  };
  const run = form => {
    const data = Object.fromEntries(new FormData(form));
    const letters = new Set((data.petals + data.center).split(''));
    if (letters.size !== 7) {
      alert('Please enter exactly 6 petal letters and 1 center letter');
      return;
    }
    window.history.pushState({}, '', `?${new URLSearchParams(data)}`);
    if (!letters.has(data.center)) {
      alert('Please enter the center letter');
      return;
    }
    renderResult(Array.from(letters).join(''), data);
  };
  setHtml('#Output', '');
  onChange('#InputForm select[name=mode]', resubmit);
  onChange('#InputForm select[name=difficulty]', resubmit);
  onSubmit('#InputForm', evt => {
    evt.preventDefault();
    run(evt.target);
  });
}

function renderResult(
  inputLetters,
  { center: inputCenterLetter, difficulty, mode }
) {
  const best = runBot({
    label: difficulty,
    compiledDictionary: dictionaries[difficulty],
    inputLetters,
    inputCenterLetter,
    frequencyOrder: frequencies[difficulty],
  });
  // prettier-ignore
  setHtml('#Output', `
    <div class="mode-${mode}">
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
          <tr class="words-used-row">
            <th>Words used</th>
            <td class="words-used">
              ${mapJoin(best.wordsUsed, play => (`
                <span class="word-item word-plus-score ${play.pangram ? 'pangram' : ''}">
                  <span class="petal">${play.petal}</span>
                  <span class="word">${spans(play.word)}</span>
                  <span class="score">${play.score}</span>
                </span>
              `))}
            </td>
          </tr>
        </tbody>
      </table>
      <h2 class="petals-table-heading">Top scores by petal</h2>
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
                  <span class="word">${spans(play.word)}</span>
                  <span class="score">${play.score}</span>
                </span>
              `))}</td>
            `))}
          </tr>
        </tbody>
      </table>
      <h2 class="all-words-heading">All Words Found</h2>
      <div class="all-words">
        ${mapJoin(best.allWords, word => (`
          <span class="word-item word-alone ${word.pangram ? 'pangram' : ''}">
            <span class="word">${word.word}</span>
          </span>
        `))}
      </div>
    </div>
  `);
}

function spans(word) {
  return word
    .split('')
    .map(letter => `<span>${letter}</span>`)
    .join('');
}
