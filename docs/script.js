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

function showHint() {
    const word = selectedWord.toLowerCase();
    const hintContent = document.getElementById('hintContent');
    
    // Try multiple sources for definition
    // First try: DuckDuckGo API (reliable and free)
    fetch(`https://api.duckduckgo.com/?q=${word}&format=json`)
        .then(response => response.json())
        .then(data => {
            let hintHTML = '';
            
            if (data.AbstractText) {
                // DuckDuckGo has a definition
                hintHTML = `<div class="hint-box">
                    <strong>Definition:</strong> ${data.AbstractText}
                </div>`;
            } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                // Try to extract definition from related topics
                const firstTopic = data.RelatedTopics[0];
                if (firstTopic.Text) {
                    hintHTML = `<div class="hint-box">
                        <strong>Definition:</strong> ${firstTopic.Text}
                    </div>`;
                } else {
                    throw new Error('No definition found');
                }
            } else {
                throw new Error('No definition found');
            }
            
            hintContent.innerHTML = hintHTML;
        })
        .catch(error => {
            console.error('Error fetching definition:', error);
            // Fallback: use a simple hint based on common words
            const hints = {
                'apple': 'A round fruit that is red, green, or yellow',
                'banana': 'A yellow fruit with soft flesh',
                'orange': 'A round citrus fruit with orange color',
                'grape': 'A small round fruit that grows in bunches',
                'lemon': 'A yellow citrus fruit with sour taste',
                'peach': 'A fuzzy round fruit with sweet flesh',
                'cherry': 'A small red or dark fruit with a pit',
                'melon': 'A large round fruit with soft flesh',
                'house': 'A building where people live',
                'school': 'A place where students learn',
                'computer': 'An electronic device for processing information',
                'window': 'An opening in a wall that lets in light',
                'doctor': 'A person who treats sick people',
                'teacher': 'A person who teaches students',
                'student': 'A person who studies and learns',
                'elephant': 'A large animal with a long trunk',
                'giraffe': 'A tall animal with a long neck',
                'tiger': 'A large striped wild cat',
                'lion': 'A large wild cat with a mane',
                'zebra': 'A striped animal similar to a horse',
                'monkey': 'A small primate with a tail',
                'bear': 'A large furry wild animal',
                'ocean': 'A large body of salty water',
                'mountain': 'A very high landform',
                'forest': 'A large area covered with trees',
                'desert': 'A dry sandy area with little water',
                'river': 'A large flowing body of water',
                'lake': 'A body of water surrounded by land',
                'beach': 'A sandy area by the sea',
                'pizza': 'An Italian baked dish with cheese and toppings',
                'burger': 'A sandwich with a meat patty',
                'pasta': 'Italian noodles made from wheat',
                'salad': 'A dish of raw vegetables',
                'soup': 'A liquid dish with vegetables or meat',
                'cake': 'A sweet baked dessert',
                'cookie': 'A small sweet baked treat'
            };
            
            const hint = hints[word];
            if (hint) {
                hintContent.innerHTML = `<div class="hint-box">
                    <strong>Definition:</strong> ${hint}
                </div>`;
            } else {
                hintContent.innerHTML = '<div class="hint-box">Definition not available. Try another word!</div>';
            }
        });
}

