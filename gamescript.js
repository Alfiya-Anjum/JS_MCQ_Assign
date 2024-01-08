// Initialize game variables
let players = [];
let currentSubject = '';
let currentQuestionIndex = 0;
let currentPlayerIndex = 0;
let currentQuestions = [];
let selectedSubject = '';
let HTMLQuestions = [];
let CSSQuestions = [];
let JSQuestions = [];
const CORRECT_BONUS = 10; // Points to add for a correct answer

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to load HTML questions from JSON file
fetch('http://127.0.0.1:8081/html.json')
    .then(response => response.json())
    .then(data => {
        HTMLQuestions = data.questions; // Make sure this matches the JSON structure
        shuffleArray(HTMLQuestions);
    })
    .catch(error => console.error('Error loading HTML questions:', error));


// Function to load CSS questions from JSON file
fetch('http://127.0.0.1:8081/css.json')
    .then(response => response.json())
    .then(data => {
        CSSQuestions = data.questions; // Assuming data has a 'questions' property
        shuffleArray(CSSQuestions);
    })
    .catch(error => console.error('Error loading CSS questions:', error));

// Function to load JS questions from JSON file
fetch('http://127.0.0.1:8081/js.json')
    .then(response => response.json())
    .then(data => {
        JSQuestions = data.questions; // Assuming data has a 'questions' property
        shuffleArray(JSQuestions);
    })
    .catch(error => console.error('Error loading JS questions:', error));

// Additional game logic...

// Add Player Function
function addPlayer() {
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput.value.trim() !== '') {
      // Add a new player object with a name and a score
      players.push({ name: playerNameInput.value.trim(), score: 0 });
      updatePlayerList();
      updateScoreDisplay(); // Update scores whenever a new player is added
      playerNameInput.value = '';
    }
  }


// Update Player List Display
function updatePlayerList() {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '';
    players.forEach((player, index) => {
        playerListDiv.innerHTML += `<div style="color: ${getPlayerColor(index)}">${player}</div>`;
    });
}

// Get Player Color (customize as needed)
function getPlayerColor(index) {
    const colors = ['red', 'blue', 'green', 'purple'];
    return colors[index % colors.length];
}

// Show Subject Selection Screen
function showSubjectSelectionScreen() {
    document.getElementById('playerSelectionScreen').style.display = 'none';
    document.getElementById('subjectSelectionScreen').style.display = 'block';
}

// Back to Player Selection Screen
function showPlayerSelectionScreen() {
    document.getElementById('subjectSelectionScreen').style.display = 'none';
    document.getElementById('playerSelectionScreen').style.display = 'block';
}

// Select Subject and Start Game
function selectSubject(subject) {
    selectedSubject = subject;
    currentQuestions = getSubjectQuestions(subject);
    startGame();
}

// Get Questions for Selected Subject
function getSubjectQuestions(subject) {
    switch (subject) {
        case 'HTML': return HTMLQuestions.slice(0, 10); // Slice first 10 questions
        case 'CSS': return CSSQuestions.slice(0, 10);
        case 'JavaScript': return JSQuestions.slice(0, 10);
        default: return [];
    }
}

// Start Game Function
function startGame() {
    document.getElementById('subjectSelectionScreen').style.display = 'none';
    document.getElementById('gamePlayScreen').style.display = 'block';
    loadQuestion();
}

// Load Question

// Attach these functions to the corresponding buttons in your HTML
function loadQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        document.getElementById('question').innerText = question.questionText;
        loadAnswerOptions(question.options);
    } else {
        endGame();
    }
}
// Load Answer Options
function loadAnswerOptions(options) {
    const answerOptionsDiv = document.getElementById('answerOptions');
    answerOptionsDiv.innerHTML = ''; // Clear existing options

    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.classList.add('answer-option');
        button.onclick = () => selectAnswer(option); // Simplified event listener attachment
        answerOptionsDiv.appendChild(button);
    });
}

function selectAnswer(selectedOption) {
    // Ensure no more answers can be selected until the next question loads
    const answerButtons = document.querySelectorAll('#answerOptions button');
    answerButtons.forEach(button => {
        button.disabled = true;
    });

    // Identify the current question and check if the selected answer is correct
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    // Apply the appropriate class based on whether the answer is correct or incorrect
    answerButtons.forEach(button => {
        if (button.innerHTML === selectedOption) {
            button.classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
        }
    });

    // Update the score if the answer is correct
    if (isCorrect) {
        players[currentPlayerIndex].score += CORRECT_BONUS;
        updateScoreDisplay();
    }

    // Display feedback message
    const feedbackMessage = document.getElementById('feedbackMessage');
    if (isCorrect) {
        feedbackMessage.textContent = 'Correct!';
        feedbackMessage.classList.add('correct-message');
        feedbackMessage.classList.remove('wrong-message');
    } else {
        feedbackMessage.textContent = 'Incorrect. The correct answer was: ' + currentQuestion.correctAnswer;
        feedbackMessage.classList.add('wrong-message');
        feedbackMessage.classList.remove('correct-message');
    }

    // Set a timeout to load the next question or end the game
    setTimeout(() => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            endGame();
        }

        // Reset feedback message and button states for the next question
        feedbackMessage.textContent = '';
        answerButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('correct-answer', 'wrong-answer');
        });
    }, 2000); // Delay before moving to the next question
}




// Call this function for each answer button
document.querySelectorAll('#answerOptions button').forEach(button => {
    button.addEventListener('click', (e) => {
        // Prevent further clicks if we are not accepting answers
        if (!acceptingAnswers) return;

        // This will be set to false when an answer is selected
        acceptingAnswers = false;
        const selectedAnswer = e.target.innerText; // Assuming the answer text is the button text
        selectAnswer(selectedAnswer);
    });
});




// Update the score display on the HTML page
function updateScoreDisplay() {
    const playerScoresDiv = document.getElementById('playerScores');
    playerScoresDiv.innerHTML = ''; // Clear current scores

    players.forEach((player, index) => {
        // Create a new div for each player's score
        const playerScoreElement = document.createElement('div');
        playerScoreElement.id = `player${index + 1}Score`; // Assign a unique ID
        playerScoreElement.textContent = `${player.name}: ${player.score} Points`;
        playerScoreElement.style.color = getPlayerColor(index); // Optional: Set color for each player

        playerScoresDiv.appendChild(playerScoreElement);
    });
}



// End Game Function
function endGame() {
    // Sort players by score in descending order
    players.sort((a, b) => b.score - a.score);

    // Determine if there's a tie for the highest score
    const highestScore = players[0].score;
    const winners = players.filter(player => player.score === highestScore);

    // Display the results
    const resultsContainer = document.getElementById('gameEndScreen');
    const resultsList = document.createElement('ul');

    for (const [index, player] of players.entries()) {
        const playerResult = document.createElement('li');
        playerResult.textContent = `${index + 1}. ${player.name}: ${player.score} Points`;
        // Highlight the winners
        if (winners.includes(player)) {
            playerResult.classList.add('winner');
        }
        resultsList.appendChild(playerResult);
    }

    resultsContainer.appendChild(resultsList);
    document.getElementById('gamePlayScreen').style.display = 'none';
    resultsContainer.style.display = 'block';

    // Create or show buttons for starting a new game and reviewing answers
    // Assume buttons already exist in HTML with the IDs 'restartGame' and 'reviewAnswers'
    document.getElementById('restartGame').style.display = 'inline-block';
    document.getElementById('reviewAnswers').style.display = 'inline-block';
}

// Increment Score function
function incrementScore(playerIndex, score) {
    players[playerIndex].score += score;
    // ... update the DOM with the new score ...
}



// Review Answers function
function reviewAnswers() {

}

// Assuming you already have event listeners set up for the buttons
document.getElementById('restartGame').addEventListener('click', restartGame);
document.getElementById('reviewAnswers').addEventListener('click', reviewAnswers);


// Restart Game Function (resets the game to initial state)
function restartGame() {
    console.log('restartGame called'); // For debugging purposes

    // Clear any existing timers
    clearInterval(timer);

    // Reset game variables
    players.forEach(player => {
        player.score = 0; // Reset each player's score to zero
    });
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    currentQuestions = []; // This should be repopulated when the game starts

    // Shuffle questions again if needed
    shuffleArray(HTMLQuestions);
    shuffleArray(CSSQuestions);
    shuffleArray(JSQuestions);

    // Clear any displayed information
    const playerScoresDiv = document.getElementById('playerScores');
    playerScoresDiv.innerHTML = '';

    const answerOptionsDiv = document.getElementById('answerOptions');
    answerOptionsDiv.innerHTML = '';

    const questionElement = document.getElementById('question');
    questionElement.innerHTML = '';

    // Hide any game end screen and show the player selection screen
    document.getElementById('gameEndScreen').style.display = 'none';
    document.getElementById('playerSelectionScreen').style.display = 'block';

    // Update the display for player list and scores
    updatePlayerList();
    // updateScoreDisplay(); // Call this if you have it defined, and it updates the score on the UI
}

// Event listener for the restart button
document.getElementById('restartGame').addEventListener('click', restartGame);


// Add event listener to 'continueToNextQuestion' button
document.getElementById('continueToNextQuestion').addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

let timer;
function startTimer(duration) {
    let timeLeft = duration;
    document.getElementById('timeLeft').textContent = timeLeft; // Set initial value to duration

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timeLeft').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);

        }
    }, 1000);
}


// Call this function when you want to start the countdown, for example when a new question is loaded
startTimer(10); // Start the timer with 10 seconds

function updateCurrentPlayerDisplay() {
    const currentPlayerElement = document.getElementById('currentPlayer');
    currentPlayerElement.textContent = players[currentPlayerIndex];
    currentPlayerElement.style.color = getPlayerColor(currentPlayerIndex);
}
function getNewQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
  function startTimer(duration, display) {
      var timer = duration, seconds;
      setInterval(function () {
          seconds = parseInt(timer % 60, 10);

          display.textContent = seconds;

          if (--timer < 0) {
              timer = duration;
          }
      }, 1000);
  }

  function startQuizTimer() {
      var tenSeconds = 10,
          display = document.querySelector('#timeLeft');
      startTimer(tenSeconds, display);
  }

  startQuizTimer(); // This will start the timer as soon as the DOM is fully loaded
});
