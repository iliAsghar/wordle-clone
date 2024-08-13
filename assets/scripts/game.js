class Letter {
  // done
  constructor (letterElem) {
    this.element = letterElem;
  }

  // done
  add(letter) {
    this.element.dataset.letter = letter; 
    this.element.innerHTML = letter;
    this.element.classList.add('guess__tile--full');
  }

  // done
  remove() {
    this.element.dataset.letter = ''; 
    this.element.innerHTML = '';
    this.element.classList.remove('guess__tile--full');
  }

  // done
  flip(colorCode) {
    switch (colorCode) {
      case 0:
        this.element.classList.add('guess__tile--absent');
        break;
      case 1:
        this.element.classList.add('guess__tile--present');
        break;
      case 2:
        this.element.classList.add('guess__tile--correct');
        break;
    }
    this.element.classList.add('guess__tile--submitted');
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
      this.nextLetter();
    }
  }

  removeLetter() {
    this.previousLetter();
    this.element.dataset.letters = (this.element.dataset.letters).slice(0, -1);
    this.currentLetter.remove();
    this.canAddLetter = true;
  }

  // done
  previousLetter() {
    if(this.currentLetterNum !== 0) {
      this.currentLetter = new Letter(this.letters[--this.currentLetterNum]);
    }
  }

  // done
  nextLetter() {
    if(this.currentLetterNum !== 4) {
      this.currentLetter = new Letter(this.letters[++this.currentLetterNum]);
    } else {
      this.currentLetterNum++;
      this.currentLetter = null;
      this.canAddLetter = false;
    }
  }

  // done
  getGuess () {
    return this.element.dataset.letters;
  }

  // done
  showResult (colorCodes) {
    this.colorCodes = colorCodes;
    return this.animateLetters();
  }

  // done
  animateLetters () {
    return new Promise(res => {
      const animateNextLetter = (index) => {
        if(index === 5) {
          res('unpause');
        } else {
          this.currentLetterNum = index;
          this.currentLetter = new Letter(this.letters[this.currentLetterNum]);
          this.currentLetter.flip(this.colorCodes[index]);
          this.currentLetter.element.addEventListener('animationend', () => {
            animateNextLetter(index + 1);
          }, { once: true });
        }
      };
      animateNextLetter(0);
    })
  }
}

class Game {

  // done
  constructor () {
    this.guesses = [...document.querySelectorAll('.guess')];
    this.currentGuessNum = 0;
    this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
    
    this.wordsGuessed = [];
  }

  // done
  async startGame () {
    await this.loadWordDictionary();
    this.generateTargetWord();
    window.onkeydown = (e) => this.handleInput(e.key);
  }

  // done
  pauseGame() {
    window.onkeydown = null;
  }

  // done
  unpauseGame() {
    window.onkeydown = (e) => this.handleInput(e.key);
  }

  // done
  generateTargetWord() {
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
    this.currentGuess = new Guess(this.guesses[++this.currentGuessNum]);
  }
  
  // done
  submitHandler() {
    this.pauseGame();
    let guessWord = this.currentGuess.getGuess();
    if(!this.isGuessValidLength(guessWord)) {
      this.showError('Not enough letters');
      this.unpauseGame();
      return;
    }
    
    if(!this.isRealWord(guessWord)) {
      this.showError('Not in word list');
      this.unpauseGame();
      return;
    }
    
    this.submitGuess(guessWord);
  }

  // done
  isGuessValidLength(guess) {
    return guess.length === 5;
  }

  showError(errorMsg) {
    // todo - add a popup to the page. set a popup timer to fase away.
    console.log(errorMsg);
    
  }

  // done
  isRealWord(word) {
    return this.dictionary.includes(word);
  }

  // done
  submitGuess(guess) {
    this.wordsGuessed.push(guess);
    let colorResults = this.getLetterColors(guess, this.targetWord);
    this.currentGuess.showResult(colorResults)
    .then(response => {
      this.unpauseGame();
    })

    if(colorResults.every(value => value == 2)) {
      this.gameOver(true);
      return;
    }
    
    if(this.wordsGuessed.length === 6) {
      this.gameOver(false);
    } else 
      this.nextGuess();
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
      }
    }
  
    for(let wordLetterInd in word) {
        if(targetArray.indexOf(word[wordLetterInd]) !== -1) {
        colors[wordLetterInd] = 1;
        targetArray[targetArray.indexOf(word[wordLetterInd])] = '*';
        continue;
      }
    }
    return colors;
  }

  // done
  async loadWordDictionary() {
    const response = await fetch('./assets/datas/words_dictionary.json');
    const wordsData = await response.json();
    this.dictionary = (Object.keys(wordsData)).filter(word => word.length === 5);
  }

  gameOver(hasWon) {
    window.onkeydown = null;
    // todo show popup
    console.log("game over");
    if(hasWon) {
      console.log("wooo won!");
    } else {
      console.log(" :( not won");
    }
    this.renderGameOverPage();
  }

  renderGameOverPage() {
    
  }
}

let test = new Game();
test.startGame();