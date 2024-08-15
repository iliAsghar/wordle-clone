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
    this.restart = this.restart.bind(this);
  }
  
  // done
  async startGame () {
    await this.loadWordDictionary();
    this.generateTargetWord();
    window.onkeydown = (e) => this.handleInput(e.key);
    this.keyboardBtns = [...document.querySelectorAll('.keyboard__key')];
    this.initiateVirtualKeyboard();
  }

  initiateVirtualKeyboard() {
    this.keyboardBtns.forEach( key => {
      key.addEventListener('click',() => {
        this.handleInput(key.dataset.key);
      });
    })    
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
    let popupContainer = document.querySelector('.pop-ups');
    let errorElem = document.createElement('p');
    errorElem.classList.add('pop-up');
    errorElem.innerHTML = errorMsg;
    errorElem.addEventListener('animationend', () => {
      errorElem.remove();
    });
    popupContainer.append(errorElem);
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
      this.updateKeyboard(guess, colorResults);
      this.unpauseGame();
      if(colorResults.every(value => value == 2)) {
        this.gameOver(true);
        return;
      }
      
      if(this.wordsGuessed.length === 6) {
        this.gameOver(false);
      } else {
        this.nextGuess();
      }
    })
  }

  // done
  getLetterColors (word, target) {
    let colors = [0, 0, 0, 0, 0];
    let targetArray = target.split('');

    for(let wordLetterInd in word) {
      if(word[wordLetterInd] === targetArray[wordLetterInd]) {
        colors[wordLetterInd] = 2;
        targetArray[wordLetterInd] = '*';
      }
    }
  
    for(let wordLetterInd in word) {
        if(targetArray.indexOf(word[wordLetterInd]) !== -1 && colors[wordLetterInd] == 0) {
        colors[wordLetterInd] = 1;
        targetArray[targetArray.indexOf(word[wordLetterInd])] = '*';
        continue;
      }
    }
    return colors;
  }

  updateKeyboard(guess, colorResults) {
    for( let letterInd in guess ) {
      let key = document.querySelector(`.keyboard__key[data-key="${guess[letterInd]}"]`);
      key.classList.add('keyboard__key--used');
      switch (colorResults[letterInd]) {
        case 2:
          key.dataset.state = 'correct';
          break;
        case 1:
          if(key.dataset.state !== 'correct') {
            key.dataset.state = 'present';
          }
          break;
        case 0:
          key.dataset.state = 'absent';
          break;
      }
    }
  }

  // done
  async loadWordDictionary() {
    const response = await fetch('./assets/datas/words_dictionary.json');
    const wordsData = await response.json();
    this.dictionary = (Object.keys(wordsData)).filter(word => word.length === 5);
  }

  gameOver(hasWon) {
    window.onkeydown = null;
    this.renderGameOverPage(hasWon);
  }

  renderGameOverPage(hasWon) {
    const gameoverPopup = document.querySelector('.gameover');
    let gameoverResult = document.createElement('h2');
    gameoverResult.classList.add('gameover__title');
    let gameoverInfo = document.createElement('p');
    gameoverInfo.classList.add('gameover__info');
    let gameoverButton = document.createElement('button');
    gameoverButton.classList.add('gameover__restart-btn');
    gameoverButton.innerHTML = 'restart';
    gameoverButton.addEventListener('click', this.restart);
    if(hasWon) {
      gameoverResult.innerHTML = 'you won!';
      gameoverInfo.innerHTML = `You correctly guesse the word : <br><span class="gameover__word">${this.targetWord}</span><br> in <span class="gamerover__number-of-guesses">${this.wordsGuessed.length}</span> tries`;
    } else {
      gameoverResult.innerHTML = 'you lost!';
      gameoverInfo.innerHTML = `the word was : <br><span class="gameover__word">${this.targetWord}</span><br> better luck next time!`;
    }
    gameoverPopup.innerHTML = '';
    gameoverPopup.append(gameoverResult, gameoverInfo, gameoverButton);
    gameoverPopup.classList.add('gameover--visible');
  }

  restart() {
    const gameoverPopup = document.querySelector('.gameover');
    gameoverPopup.classList.remove('gameover--visible');
    
    document.querySelector('.game').innerHTML = `
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
      <div class="guess" data-letters="">
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
        <div class="guess__tile" data-letter=""></div>
      </div>
    `;

    document.querySelector('.keyboard').innerHTML = `
      <div class="keyboard-row">
        <button class="keyboard__key" data-key="q">q</button>
        <button class="keyboard__key" data-key="w">w</button>
        <button class="keyboard__key" data-key="e">e</button>
        <button class="keyboard__key" data-key="r">r</button>
        <button class="keyboard__key" data-key="t">t</button>
        <button class="keyboard__key" data-key="y">y</button>
        <button class="keyboard__key" data-key="u">u</button>
        <button class="keyboard__key" data-key="i">i</button>
        <button class="keyboard__key" data-key="o">o</button>
        <button class="keyboard__key" data-key="p">p</button>
      </div>
      <div class="keyboard-row">
        <div class="keyboard__half-space"></div>
        <button class="keyboard__key keyboard__key--correct" data-key="a">a</button>
        <button class="keyboard__key keyboard__key--present" data-key="s">s</button>
        <button class="keyboard__key" data-key="d">d</button>
        <button class="keyboard__key" data-key="f">f</button>
        <button class="keyboard__key" data-key="g">g</button>
        <button class="keyboard__key" data-key="h">h</button>
        <button class="keyboard__key" data-key="j">j</button>
        <button class="keyboard__key" data-key="k">k</button>
        <button class="keyboard__key" data-key="l">l</button>
        <div class="keyboard__half-space"></div>
      </div>
      <div class="keyboard-row">
        <button class="keyboard__key keyboard__key--big" data-key="Enter">
          <i class="fa-solid fa-right-to-bracket"></i>
        </button>
        <button class="keyboard__key" data-key="z">z</button>
        <button class="keyboard__key" data-key="x">x</button>
        <button class="keyboard__key" data-key="c">c</button>
        <button class="keyboard__key" data-key="v">v</button>
        <button class="keyboard__key" data-key="b">b</button>
        <button class="keyboard__key" data-key="n">n</button>
        <button class="keyboard__key" data-key="m">m</button>
        <button class="keyboard__key keyboard__key--big" data-key="Backspace">
          <i class="fa-solid fa-delete-left"></i>
        </button>
      </div>
    `;

    this.guesses = [...document.querySelectorAll('.guess')];
    this.currentGuessNum = 0;
    this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
    
    this.wordsGuessed = [];
    this.initiateVirtualKeyboard();
    this.startGame();
  }
}

let test = new Game();
test.startGame();