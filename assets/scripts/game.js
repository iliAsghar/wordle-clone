class Letter {
  constructor (letterElem) {
    this.element = letterElem;
  }

  add(letter) {
    this.element.dataset.letter = letter; 
    this.element.innerHTML = letter;
    this.element.classList.add('.guess__tile--full');
  }

  remove() {
    this.element.dataset.letter = ''; 
    this.element.innerHTML = '';
    this.element.classList.remove('.guess__tile--full');
  }
}

class Guess {
  constructor (guessElem) {
    this.canAddLetter = true;

    this.element = guessElem;
    this.letters = [...this.element.querySelectorAll('.guess__tile')];
    this.currentLetterNum = 0;
    this.currentLetter = new Letter(this.letters[this.currentLetterNum]);
  }

  addLetter(letter) {
    if(this.canAddLetter) {
      this.currentLetter.add(letter);
      this.element.dataset.letters += letter;
      this.updateLetters(letter);
    }
  }

  removeLetter() {
    this.currentLetter.remove();
    this.element.dataset.letters = (this.element.dataset.letters).slice(0, -1);
    this.previousLetter();
    this.canAddLetter = true;
  }

  previousLetter() {
    if(this.currentLetterNum !== 0) {
      this.currentLetter = new Letter(--this.currentLetterNum);
    }
  }

  nextLetter() {
    if(this.currentLetterNum !== 4) {
      this.currentLetter = new Letter(++this.currentLetterNum);
    } else {
      this.canAddLetter = false;
    }
  }

  isFullGuess() {
    return (this.element.dataset.letters.length === 5);
  }

  getGuess () {
    return this.element.dataset.letters;
  }

  submit() {

  }
}

class Game {
  constructor () {
    this.canAddLetter = true;

    // this.guesses = [...document.querySelectorAll('.guess')];
    // this.currentGuessNum = 0;
    // this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
  }

  startGame () {


    // init event listeners
    window.addEventListener('keydown', (e) => this.handleInput(e.key));
  }

  handleInput(key) {
    // defined a regex pattern to filter out letter entries.
    const regex = /^[a-zA-Z]+$/;

    // if it's a letter, add it.
    if (key.length === 1 && regex.test(key)) {
      this.currentGuess.addLetter(key);

    // if it's Enter, submit the guess.
    } else if (key === "Enter") {
      this.submitGuess();

    // if it's Backspace, remove a letter.
    } else if(key === "Backspace") {
      this.currentGuess.removeLetter();
    }
  }

  nextGuess() {
    this.currentGuess = new Guess(++this.currentGuessNum);
  }

  submitGuess() {
    if(this.currentGuess.isFullGuess) {
      this.currentGuess.submit();

      let guessWord = this.currentGuess.getGuess();
      let APIlink = `https://api.dictionaryapi.dev/api/v2/entries/en/${guessWord}`;
      
      fetch(APIlink)
        .then(response => {
          if(!response.ok) {
            throw new Error('Not a real word!');
          }
          // if the word is ok
          // ...
        })
        .catch(() => {
          // if the word is NOT ok
          // ...
        })
        .then(() => {

          // check if it's over.
          this.nextGuess();
        })
      
    }
  }
}

let APIlink = `https://api.dictionaryapi.dev/api/v2/entries/en/somssss`;
      
fetch(APIlink)
  .then(response => {
    if(!response.ok) {
      throw new Error;
    }
    
    // if the word is ok
  })
  .catch(() => {
    // if the word is NOT ok
  })