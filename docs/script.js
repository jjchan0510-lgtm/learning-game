const wordList = [
    'APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'LEMON', 'PEACH', 'CHERRY', 'MELON',
    'HOUSE', 'SCHOOL', 'COMPUTER', 'WINDOW', 'DOCTOR', 'TEACHER', 'STUDENT',
    'ELEPHANT', 'GIRAFFE', 'TIGER', 'LION', 'ZEBRA', 'MONKEY', 'BEAR',
    'OCEAN', 'MOUNTAIN', 'FOREST', 'DESERT', 'RIVER', 'LAKE', 'BEACH',
    'PIZZA', 'BURGER', 'PASTA', 'SALAD', 'SOUP', 'CAKE', 'COOKIE'
];

let selectedWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let maxWrongGuesses = 6;
let gameOver = false;

const hangmanParts = [
    'gallows', 'pole', 'beam', 'rope', 'head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'
];

function startGame() {
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    guessedLetters = [];
    wrongGuesses = 0;
    gameOver = false;
    
    updateWordDisplay();
    updateGameStatus();
    createAlphabetButtons();
    clearHangman();
}

function createAlphabetButtons() {
    const alphabetContainer = document.getElementById('alphabet');
    alphabetContainer.innerHTML = '';
    
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.className = 'letter-btn';
        button.textContent = letter;
        button.onclick = () => guessLetter(letter);
        alphabetContainer.appendChild(button);
    }
}

function guessLetter(letter) {
    if (gameOver || guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    
    if (selectedWord.includes(letter)) {
        // Correct guess
        document.querySelector(`.letter-btn:nth-child(${letter.charCodeAt(0) - 64})`).classList.add('correct');
        updateWordDisplay();
        checkWin();
    } else {
        // Wrong guess
        wrongGuesses++;
        document.querySelector(`.letter-btn:nth-child(${letter.charCodeAt(0) - 64})`).classList.add('incorrect');
        drawHangmanPart();
        checkLose();
    }
    
    // Disable the button
    document.querySelector(`.letter-btn:nth-child(${letter.charCodeAt(0) - 64})`).disabled = true;
}

function updateWordDisplay() {
    const display = selectedWord.split('').map(letter => 
        guessedLetters.includes(letter) ? letter : '_'
    ).join('');
    document.getElementById('wordDisplay').textContent = display;
}

function updateGameStatus() {
    const status = document.getElementById('gameStatus');
    status.className = 'game-status';
    
    if (gameOver) {
        if (wrongGuesses >= maxWrongGuesses) {
            status.textContent = `Game Over! The word was: ${selectedWord}`;
            status.classList.add('lose');
        } else {
            status.textContent = 'Congratulations! You won!';
            status.classList.add('win');
        }
    } else {
        status.textContent = `Wrong guesses: ${wrongGuesses}/${maxWrongGuesses}`;
    }
}

function drawHangmanPart() {
    if (wrongGuesses <= hangmanParts.length) {
        const part = document.createElement('div');
        part.className = `hangman-part ${hangmanParts[wrongGuesses - 1]}`;
        document.getElementById('hangmanDrawing').appendChild(part);
    }
    updateGameStatus();
}

function clearHangman() {
    document.getElementById('hangmanDrawing').innerHTML = '';
}

function checkWin() {
    const wordLetters = selectedWord.split('').filter(letter => letter !== ' ');
    const uniqueLetters = [...new Set(wordLetters)];
    const correctGuesses = guessedLetters.filter(letter => uniqueLetters.includes(letter));
    
    if (correctGuesses.length === uniqueLetters.length) {
        gameOver = true;
        updateGameStatus();
        disableAllButtons();
    }
}

function checkLose() {
    if (wrongGuesses >= maxWrongGuesses) {
        gameOver = true;
        updateGameStatus();
        disableAllButtons();
        // Reveal the word
        document.getElementById('wordDisplay').textContent = selectedWord;
    }
}

function disableAllButtons() {
    const buttons = document.querySelectorAll('.letter-btn');
    buttons.forEach(button => button.disabled = true);
}

function pronounceWord(accent = 'us') {
    const word = selectedWord.toLowerCase();
    
    // Use browser's text-to-speech directly - most reliable
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        
        // Set language based on accent
        if (accent === 'us') {
            utterance.lang = 'en-US';
        } else if (accent === 'uk') {
            utterance.lang = 'en-GB';
        }
        
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Cancel any previous speech
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    } else {
        alert('Speech synthesis is not supported in your browser.');
    }
}

function showHint() {
    const word = selectedWord.toLowerCase();
    const hintContent = document.getElementById('hintContent');
    
    // Built-in dictionary with all game words
    const hints = {
        'apple': 'A round fruit that is red, green, or yellow',
        'banana': 'A yellow tropical fruit with soft flesh',
        'orange': 'A round citrus fruit with orange color',
        'grape': 'A small round fruit that grows in bunches',
        'lemon': 'A yellow citrus fruit with very sour taste',
        'peach': 'A fuzzy round fruit with sweet flesh',
        'cherry': 'A small red or dark fruit with a pit',
        'melon': 'A large round fruit with sweet watery flesh',
        'house': 'A building where people live',
        'school': 'A place where students learn from teachers',
        'computer': 'An electronic device for processing information',
        'window': 'An opening in a wall that lets in light and air',
        'doctor': 'A person trained to treat sick people',
        'teacher': 'A person who teaches students in school',
        'student': 'A person who studies and learns at school',
        'elephant': 'A very large animal with a long trunk and big ears',
        'giraffe': 'A tall animal with a very long neck',
        'tiger': 'A large striped wild cat with orange and black fur',
        'lion': 'A large wild cat with a thick mane around the head',
        'zebra': 'A striped animal similar to a horse',
        'monkey': 'A small primate with a tail that swings on trees',
        'bear': 'A large furry wild animal that eats fish and meat',
        'ocean': 'A very large body of salty water',
        'mountain': 'A very high landform with steep sides',
        'forest': 'A large area covered with many trees',
        'desert': 'A dry sandy area with very little water or plants',
        'river': 'A large flowing body of water',
        'lake': 'A body of water surrounded by land',
        'beach': 'A sandy area by the sea or ocean',
        'pizza': 'An Italian baked dish with cheese and toppings',
        'burger': 'A sandwich with a meat patty between bread',
        'pasta': 'Italian noodles made from wheat',
        'salad': 'A dish made of raw vegetables',
        'soup': 'A hot liquid dish with vegetables or meat',
        'cake': 'A sweet baked dessert made with flour and sugar',
        'cookie': 'A small sweet baked treat'
    };
    
    const hint = hints[word];
    if (hint) {
        hintContent.innerHTML = `<div class="hint-box">
            <strong>Hint:</strong> ${hint}
        </div>`;
    } else {
        hintContent.innerHTML = '<div class="hint-box">No hint available for this word.</div>';
    }
}

