class Letter {
  // done
  constructor (letterElem) {
    this.element = letterElem;
  }

  // done
  add(letter) {
    this.element.dataset.letter = letter; 
    this.element.innerHTML = letter;
    this.element.classList.add('.guess__tile--full');
  }

  // done
  remove() {
    this.element.dataset.letter = ''; 
    this.element.innerHTML = '';
    this.element.classList.remove('.guess__tile--full');
  }
}

class Guess {
  // done
  constructor (guessElem) {
    this.canAddLetter = true;

    this.element = guessElem;
    this.letters = [...this.element.querySelectorAll('.guess__tile')];
    this.currentLetterNum = 0;
    this.currentLetter = new Letter(this.letters[this.currentLetterNum]);
  }

  // done
  addLetter(letter) {
    if(this.canAddLetter) {
      this.currentLetter.add(letter);
      this.element.dataset.letters += letter;
      this.updateLetters(letter);
    }
  }

  // done
  removeLetter() {
    this.currentLetter.remove();
    this.element.dataset.letters = (this.element.dataset.letters).slice(0, -1);
    this.previousLetter();
    this.canAddLetter = true;
  }

  // done
  previousLetter() {
    if(this.currentLetterNum !== 0) {
      this.currentLetter = new Letter(--this.currentLetterNum);
    }
  }

  // done
  nextLetter() {
    if(this.currentLetterNum !== 4) {
      this.currentLetter = new Letter(++this.currentLetterNum);
    } else {
      this.canAddLetter = false;
    }
  }

  // done
  getGuess () {
    return this.element.dataset.letters;
  }
}

class Game {
  constructor () {
    this.guesses = [...document.querySelectorAll('.guess')];
    this.currentGuessNum = 0;
    this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
    
    this.wordsGuessed = [];

    // essential methods :
    this.loadWordDictionary();
  }

  startGame () {
    window.addEventListener('keydown', (e) => this.handleInput(e.key));
  }

  // done
  handleInput(key) {
    // defined a regex pattern to filter out letter entries.
    const regex = /^[a-zA-Z]+$/;

    // if it's a letter, add it.
    if (key.length === 1 && regex.test(key)) {
      this.currentGuess.addLetter(key);

    // if it's Enter, submit the guess.
    } else if (key === "Enter") {
      this.submitHandler();

    // if it's Backspace, remove a letter.
    } else if(key === "Backspace") {
      this.currentGuess.removeLetter();
    }
  }

  // done
  nextGuess() {
    this.currentGuess = new Guess(++this.currentGuessNum);
  }

  submitHandler() {
    let guessWord = this.currentGuess.getGuess();
    if(!this.isGuessValidLength(guessWord)) {
      // todo error for length. maybe a function?
      return;
    }
    
    if(!this.isRealWord(guessWord)) {
      // todo error for not a real word. maybe a function?
      return;
    }
    
    this.submitGuess(guessWord);
  }

  // done
  isGuessValidLength(guess) {
    return guess.length === 5;
  }

  // done
  isRealWord(word) {
    return this.dictionary.hasOwnProperty(word);
  }

  submitGuess(guess) {
    this.wordsGuessed.append(guess);
    if(this.wordsGuessed.length === 6) {
      this.gameOver();
    } else {
      this.nextGuess();
    }
  }

  // done
  loadWordDictionary() {
    fetch('./assets/datas/words_dictionary.json')
      .then(response => response.json())
      .then(wordsData => {
        this.dictionary = wordsData;
        console.log(this.dictionary);
        
      })
  }

  gameOver() {

  }
}