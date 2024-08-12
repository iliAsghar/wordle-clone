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

  showResult (colorCodes) {
    for (let colorCodeInd in colorCodes) {
      this.currentLetterNum = colorCodeInd;
      this.currentLetter = new Letter(this.currentLetterNum);
      switch (colorCodes[colorCodeInd]) {
        case 2:
          // flip + set correct
          break;
        case 1:
          // flip + set present
          break;
        case 0:
          // flip + set absent
          break;
      }
      // do the flip animation
      // ? or maybe we could do the animation
    }
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
    this.generateTargetWord();
    window.addEventListener('keydown', (e) => this.handleInput(e.key));
  }

  pauseGame() {
    window.removeEventListener('keydown', (e) => this.handleInput(e.key));
  }

  resumeGame() {
    window.addEventListener('keydown', (e) => this.handleInput(e.key));
  }

  generateTargetWord() {
    // ? this could also be based on date or something.
    this.targetWord = this.dictionary[Math.floor(Math.random() * this.dictionary.length)];
  }

  // done
  handleInput(key) {
    // defined a regex pattern to filter out letter entries.
    const regex = /^[a-zA-Z]+$/;

    // if it's a letter, add it.
    if (key.length === 1 && regex.test(key)) {
      this.currentGuess.addLetter(key.toLowerCase());

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
    this.pauseGame();
    let guessWord = this.currentGuess.getGuess();
    if(!this.isGuessValidLength(guessWord)) {
      // todo error for length. maybe a function?
      this.resumeGame();
      return;
    }
    
    if(!this.isRealWord(guessWord)) {
      // todo error for not a real word. maybe a function?
      this.resumeGame();
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
    return this.dictionary.includes(word);
  }

  submitGuess(guess) {
    this.wordsGuessed.append(guess);
    let colorResults = this.getLetterColors(guess, this.targetWord);
    this.currentGuess.showResult(colorResults);
    // todo submit from the guess object(class) 
    
    if(this.wordsGuessed.length === 6) {
      this.gameOver();
    } else {
      this.nextGuess();
      this.resumeGame();
    }
  }

  // done
  getLetterColors (word, target) {
    let colors = [0, 0, 0, 0, 0];
    let targetArray = target.split('');
  
    for(let wordLetterInd in word) {
      if(word[wordLetterInd] === targetArray[wordLetterInd]) {
        colors[wordLetterInd] = 2;
        targetArray[wordLetterInd] = '*';
        continue;
      } else if(targetArray.indexOf(word[wordLetterInd]) !== -1) {
        colors[wordLetterInd] = 1;
        targetArray[targetArray.indexOf(word[wordLetterInd])] = '*';
        continue;
      }
    }
    return colors;
  }

  // done
  loadWordDictionary() {
    fetch('./assets/datas/words_dictionary.json')
      .then(response => response.json())
      .then(wordsData => {
        this.dictionary = (Object.keys(wordsData)).filter(word => word.length === 5);
      })
  }

  gameOver() {

  }
}