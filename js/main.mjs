import { onSubmit } from './domUtils.mjs';
import { runBot } from './runBot.mjs';

const dictionaries = {};
fetch('/data/compiled-level3.txt')
  .then(resp => resp.text)
  .then(text => (dictionaries.hard = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

fetch('/data/compiled-level2.txt')
  .then(resp => resp.text)
  .then(text => (dictionaries.medium = text))
  .catch(err => alert('Error downloading dictionary!\n\n' + err.message));

onSubmit('#InputForm', evt => {
  evt.preventDefault();
  const data = new FormData(evt.target);
  const inputLetters = data.get('inputLetters');
  const inputCenterLetter = data.get('inputCenterLetter');
  const letters = new Set((inputLetters + inputCenterLetter).split(''));
  if (letters.size !== 7) {
    alert('Please enter exactly 6 petal letters and 1 center letter');
    return;
  }
  if (!letters.has(inputCenterLetter)) {
    alert('Please enter the center letter');
    return;
  }
  renderResult(inputLetters, inputCenterLetter);
});

function renderResult(inputLetters, inputCenterLetter) {
  const best = runBot({
    label: 'bot',
    compiledDictionary: dictionaries.medium,
    inputLetters,
    inputCenterLetter,
    frequencyOrder: 'jqzxwkvfybphgmcudlotrsnaie',
  });
}
