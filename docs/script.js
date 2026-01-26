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
    
    // Use Forvo API as primary source, fallback to text-to-speech
    fetch(`https://apifree.forvo.com/action/word-pronunciations/format/json/word/${word}/language/en/`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                let audioUrl = '';
                
                if (accent === 'us') {
                    // Find US pronunciation
                    const usAudio = data.items.find(item => item.country_id === '1' || item.country === 'America');
                    audioUrl = usAudio ? usAudio.pathmp3 : data.items[0].pathmp3;
                } else if (accent === 'uk') {
                    // Find UK pronunciation
                    const ukAudio = data.items.find(item => item.country_id === '13' || item.country === 'England');
                    audioUrl = ukAudio ? ukAudio.pathmp3 : data.items[0].pathmp3;
                }
                
                if (audioUrl) {
                    const audio = new Audio(audioUrl);
                    audio.play().catch(err => {
                        console.error('Error playing audio:', err);
                        fallbackTTS(word, accent);
                    });
                } else {
                    fallbackTTS(word, accent);
                }
            } else {
                fallbackTTS(word, accent);
            }
        })
        .catch(error => {
            console.error('Error fetching from Forvo:', error);
            fallbackTTS(word, accent);
        });
}

function fallbackTTS(word, accent) {
    // Fallback to browser's text-to-speech if API fails
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
        
        speechSynthesis.speak(utterance);
    } else {
        alert('Pronunciation not available and speech synthesis not supported in your browser.');
    }
}

// Start the game when the page loads
startGame();
