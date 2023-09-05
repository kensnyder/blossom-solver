# Blossom Solver

A solver for the [Blossom](https://www.merriam-webster.com/games/blossom-word-game)
word game. The solver is for non-commercial education purposes only.
All trandemarks belong to Merriam-Webster.

## Motivation

I love playing Blossom but always wonder how my score stacks up against the
best possible score. This tool attempts to find a high score for a given puzzle.
You can also use it in "Hints mode" before you complete the puzzle. It will
give you hints including the number of possible pangrams, number of possible
words, and high score.

## Dictionaries

### Overview

Merriam-Webster does not specify what dictionary is used for the game. We only
have some guidelines:

1. No hyphenated words
1. No swear words
1. No proper nouns

Additionally, due to the nature of the game, we have the following constraints:

1. Words must have 7 or fewer distinct letters
2. Words must have 4 or more letters

### Process

Many dictionaries are available online. The Scrabble dictionary is perhaps
the best guess at the contents of the Blossom dictionary, but it does not
contain words with more than 15 letters because those are impossible to play
in Scrabble.

### Levels

This Blossom solver includes 3 different dictionaries for 3 different skill
levels.

### Level 3 (Expert)

I started with the largest dictionary I could find, from this GitHub
repository:
[https://github.com/dwyl/english-words](https://github.com/dwyl/english-words)
which has about 370k words.

Note that it and all other files mentioned below are in the
[data](https://github.com/kensnyder/blossom-solver/tree/main/data) directory
of this repository.

1. That dictionary, saved as `data/full-dictionary.txt`, contains about 370k
   words.
2. I removed all words with 4 or fewer letters and 7 or fewer distinct letters.
3. I then broke that file into smaller files by number of letters, which are
   found in `data/*-letters.txt`
4. In chunks, I checked the HTML for each dictionary entry from
   Merriam-Webster's website.
5. That allowed me to identify medical words, proper nouns, and words not in
   Merriam-Webster's dictionary. Those are saved in `data/medical-words.txt`,
   `data/proper-nouns.txt`, and `data/not-in-dictionary.txt`.
6. I then downloaded a list of swear words from
   [this GitHub Repository](https://github.com/coffee-and-fun/google-profanity-words/blob/main/data/en.txt).
   and saved it rot13-encoded as `data/swear-words.rot13.txt`
7. I then used `scripts/compile-words.mjs` to remove all those invalid words
   from `data/full-dictionary.txt`, leaving 118k words saved to
   `data/uncompiled-level3.txt`.

### Level 2 (Intermediate)

1. I started with the Wiktionary 100k, a 2005 compilation from Wiktionary.org.
   That file is saved as data/wiktionary-100k.txt.
2. I removed all words with 4 or fewer letters and 7 or fewer distinct letters.
3. I removed all words not present in the level 3 dictionary
4. I saved the result to `data/uncompiled-level2.txt. That file contains 26k
   words.

### Level 1 (Beginner)

Coming soon. I will likely use the Level 2 dictionary and remove words that
I've personally never heard of.

### But wait!

After you complete a game, Blossom will show you all the words and pangrams
that were possible. Looking at words on the list, I discovered some words that
in the Blossom game that are not in `data/full-dictionary.txt`. I manually added
those words to `data/discovered-words.txt`. Those are included in the final
uncompiled and compiled dictionaries.

## Precompilation

I've chosen to precompile the dictionaries to allow the solver to provide
solutions in a matter of milliseconds. The downside is that your browser has
to download these larger files upon page load.

By example, here is the scheme for the compilation format:

```txt
mustard24+
muster11
mustered27mustrd32e+
```

1. Words start at a line break and continue until encountering a number
2. A plus is added to the end of a word if it is a pangram
3. If the word has multiple sections of letters/numbers, the sections indicate
   how many points each bonus petal letter would produce.

```txt
# mustard is a pangram worth 24 points regardless of which letter is the bonus petal
mustard24+

# muster is not a pangram and worth 11 points regardless of which letter is the bonus petal.
muster11

# mustered is a pangram
# If the bonus petal is m, u, s, t, r or d, it is worth 27 points
# If the bonus petal is e, it is worth 32 points
mustered27mustrd32e+
```

## Use

The solver is available on [GitHub Pages here](https://kensnyder.github.io/blossom-solver/).
