class Letter {
  constructor (letterElem) {
    this.element = letterElem;
  }

  add(letter) {
    this.element.dataset.letter = letter; 
    this.element.innerHTML = letter;
    this.element.classList.add('guess__tile--full');
  }

  remove() {
    this.element.dataset.letter = ''; 
    this.element.innerHTML = '';
    this.element.classList.remove('guess__tile--full');
  }

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

  wiggle() {
    this.element.classList.add('guess__tile--wiggle');
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
      this.nextLetter();
    }
  }

  removeLetter() {
    this.previousLetter();
    this.element.dataset.letters = (this.element.dataset.letters).slice(0, -1);
    this.currentLetter.remove();
    this.canAddLetter = true;
  }

  previousLetter() {
    if(this.currentLetterNum !== 0) {
      this.currentLetter = new Letter(this.letters[--this.currentLetterNum]);
    }
  }

  nextLetter() {
    if(this.currentLetterNum !== 4) {
      this.currentLetter = new Letter(this.letters[++this.currentLetterNum]);
    } else {
      this.currentLetterNum++;
      this.currentLetter = null;
      this.canAddLetter = false;
    }
  }

  getGuess () {
    return this.element.dataset.letters;
  }

  showResult (colorCodes) {
    this.colorCodes = colorCodes;
    return this.animateLetters();
  }

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

  correctAnimation() {
    return new Promise(res => {
      const animateNextLetter = (index) => {
        if(index === 5) {
          res();
        } else {
          this.currentLetterNum = index;
          this.currentLetter = new Letter(this.letters[this.currentLetterNum]);
          this.currentLetter.wiggle();
          this.currentLetter.element.addEventListener('animationend', () => {
            animateNextLetter(index + 1);
          }, { once: true });
        }
      };
      animateNextLetter(0);
    })
  }
}

class Wordle {
  
  constructor () {
    this.guesses = [...document.querySelectorAll('.guess')];
    this.currentGuessNum = 0;
    this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
    
    this.wordsGuessed = [];
    this.restart = this.restart.bind(this);
    this.initiateVirtualKeyboard();
  }
  
  async startGame () {
    await this.loadWordDictionary();
    this.generateTargetWord();
    window.onkeydown = (e) => this.handleInput(e.key);
  }
  
  pauseGame() {
    window.onkeydown = null;
  }
  
  unpauseGame() {
    window.onkeydown = (e) => this.handleInput(e.key);
  }

  async gameOver(hasWon) {
    window.onkeydown = null;
    if(hasWon) {
      await this.currentGuess.correctAnimation();
    }
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
    
    this.guesses.forEach(guessElem => {
      guessElem.dataset.letters = '';
      guessElem.querySelectorAll('.guess__tile').forEach(tile => {
        tile.dataset.letter = '';
        tile.className = 'guess__tile';
        tile.innerHTML = '';
      });
    });

    this.keyboardBtns.forEach(key => {
      key.className = 'keyboard__key';
      key.dataset.state = '';
    });
      
    this.currentGuessNum = 0;
    this.currentGuess = new Guess(this.guesses[this.currentGuessNum]);
    this.wordsGuessed = [];
    this.startGame();
  }
  
  async loadWordDictionary() {
    const response = await fetch('./assets/datas/words_dictionary.json');
    const wordsData = await response.json();
    this.dictionary = (Object.keys(wordsData)).filter(word => word.length === 5);
  }
  
  generateTargetWord() {
    this.targetWord = this.dictionary[Math.floor(Math.random() * this.dictionary.length)];
  }

  initiateVirtualKeyboard() {
    this.keyboardBtns = [...document.querySelectorAll('.keyboard__key')];
    
    this.keyboardBtns.forEach( key => {
      key.addEventListener('click',() => {
        this.handleInput(key.dataset.key);
      });
    })    
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

  handleInput(key) {
    const regex = /^[a-zA-Z]+$/;

    if (key.length === 1 && regex.test(key)) {
      this.currentGuess.addLetter(key.toLowerCase());
      
    } else if (key === "Enter") {
      this.submitHandler();
      
    } else if(key === "Backspace") {
      this.currentGuess.removeLetter();
    }
  }

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

  isGuessValidLength(guess) {
    return guess.length === 5;
  }
  
  isRealWord(word) {
    return this.dictionary.includes(word);
  }
  
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

  getLetterColors(word, target) {
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
  
  nextGuess() {
    this.currentGuess = new Guess(this.guesses[++this.currentGuessNum]);
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
}

let game = new Wordle();
game.startGame();