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
let nextLetterIndex = 0;  // Track which letter in the sequence should be guessed next

const hangmanParts = [
    'gallows', 'pole', 'beam', 'rope', 'head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'
];

function startGame() {
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    guessedLetters = [];
    wrongGuesses = 0;
    gameOver = false;
    nextLetterIndex = 0;  // Reset to first letter
    
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
    if (gameOver) return;
    
    const buttonElement = document.querySelector(`.letter-btn:nth-child(${letter.charCodeAt(0) - 64})`);
    
    // Check if button is already disabled (only for correctly guessed letters that won't repeat)
    if (buttonElement.disabled) return;
    
    // Check if this is the correct next letter in the sequence
    const correctLetter = selectedWord[nextLetterIndex];
    
    if (letter === correctLetter) {
        // Correct guess - it's the next letter in sequence
        guessedLetters.push(letter);
        buttonElement.classList.add('correct');
        nextLetterIndex++;
        updateWordDisplay();
        checkWin();
        
        // Only disable button if the next letter is NOT the same (no more repetitions needed)
        if (nextLetterIndex < selectedWord.length && selectedWord[nextLetterIndex] === letter) {
            // Keep enabled for next repetition
            buttonElement.disabled = false;
        } else {
            // Disable since we've moved past this letter
            buttonElement.disabled = true;
        }
    } else {
        // Wrong guess - keep button enabled so they can try again later
        wrongGuesses++;
        buttonElement.classList.add('incorrect');
        drawHangmanPart();
        checkLose();
    }
}

function updateWordDisplay() {
    const display = selectedWord.split('').map((letter, index) => 
        index < nextLetterIndex ? letter : '_'
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
    // Win when all letters have been guessed in sequence
    if (nextLetterIndex === selectedWord.length) {
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
    
    console.log('Pronouncing word:', word, 'with accent:', accent);
    
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
        
        // Add event listeners for debugging
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => console.log('Speech ended');
        utterance.onerror = (event) => console.error('Speech error:', event);
        
        speechSynthesis.speak(utterance);
        console.log('Speaking triggered');
    } else {
        console.error('Speech synthesis not supported');
        alert('Speech synthesis is not supported in your browser.');
    }
}

function showHint() {
    const word = selectedWord.toLowerCase().trim();
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
    
    console.log('Selected word:', selectedWord);
    console.log('Looking for:', word);
    console.log('Available hints:', Object.keys(hints));
    
    const hint = hints[word];
    console.log('Found hint:', hint);
    
    if (hint) {
        hintContent.innerHTML = `<div class="hint-box">
            <strong>Hint:</strong> ${hint}
        </div>`;
    } else {
        hintContent.innerHTML = `<div class="hint-box">No hint available for "${word}". This word is not in the dictionary.</div>`;
    }
}

// Start the game when the page loads
startGame();

