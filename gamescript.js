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
        HTMLQuestions = data.questions; 
        shuffleArray(HTMLQuestions);
    })
    .catch(error => console.error('Error loading HTML questions:', error));



fetch('http://127.0.0.1:8081/css.json')
    .then(response => response.json())
    .then(data => {
        CSSQuestions = data.questions; 
        shuffleArray(CSSQuestions);
    })
    .catch(error => console.error('Error loading CSS questions:', error));


fetch('http://127.0.0.1:8081/js.json')
    .then(response => response.json())
    .then(data => {
        JSQuestions = data.questions; 
        shuffleArray(JSQuestions);
    })
    .catch(error => console.error('Error loading JS questions:', error));




function addPlayer() {
    const playerNameInput = document.getElementById('playerNameInput');
    if (playerNameInput.value.trim() !== '') {
      players.push({ name: playerNameInput.value.trim(), score: 0 });
      updatePlayerList();
      updateScoreDisplay(); 
      playerNameInput.value = '';
    }
  }



function updatePlayerList() {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = '';
    players.forEach((player, index) => {
        playerListDiv.innerHTML += `<div style="color: ${getPlayerColor(index)}">${player}</div>`;
    });
}

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

//  Subject and Start Game
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
   
    const answerButtons = document.querySelectorAll('#answerOptions button');
    answerButtons.forEach(button => {
        button.disabled = true;
    });

    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

   
    answerButtons.forEach(button => {
        if (button.innerHTML === selectedOption) {
            button.classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
        }
    });

   
    if (isCorrect) {
        players[currentPlayerIndex].score += CORRECT_BONUS;
        updateScoreDisplay();
    }

   
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

    //  timeout to load the next question or end the game
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
    }, 2000); 
}





document.querySelectorAll('#answerOptions button').forEach(button => {
    button.addEventListener('click', (e) => {
        
        if (!acceptingAnswers) return;

      
        acceptingAnswers = false;
        const selectedAnswer = e.target.innerText; 
        selectAnswer(selectedAnswer);
    });
});




// Update the score display on the HTML page
function updateScoreDisplay() {
    const playerScoresDiv = document.getElementById('playerScores');
    playerScoresDiv.innerHTML = ''; 

    players.forEach((player, index) => {
       
        const playerScoreElement = document.createElement('div');
        playerScoreElement.id = `player${index + 1}Score`; 
        playerScoreElement.textContent = `${player.name}: ${player.score} Points`;
        playerScoreElement.style.color = getPlayerColor(index);

        playerScoresDiv.appendChild(playerScoreElement);
    });
}



// End Game Function
function endGame() {
   
    players.sort((a, b) => b.score - a.score);

  
    const highestScore = players[0].score;
    const winners = players.filter(player => player.score === highestScore);

   
    const resultsContainer = document.getElementById('gameEndScreen');
    const resultsList = document.createElement('ul');

    for (const [index, player] of players.entries()) {
        const playerResult = document.createElement('li');
        playerResult.textContent = `${index + 1}. ${player.name}: ${player.score} Points`;
       
        if (winners.includes(player)) {
            playerResult.classList.add('winner');
        }
        resultsList.appendChild(playerResult);
    }

    resultsContainer.appendChild(resultsList);
    document.getElementById('gamePlayScreen').style.display = 'none';
    resultsContainer.style.display = 'block';

   
    document.getElementById('restartGame').style.display = 'inline-block';
    document.getElementById('reviewAnswers').style.display = 'inline-block';
}


function incrementScore(playerIndex, score) {
    players[playerIndex].score += score;
    
}



// Review Answers function
function reviewAnswers() {

}


document.getElementById('restartGame').addEventListener('click', restartGame);
document.getElementById('reviewAnswers').addEventListener('click', reviewAnswers);



function restartGame() {
    console.log('restartGame called'); 

    
    clearInterval(timer);

    
    players.forEach(player => {
        player.score = 0; 
    });
    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    currentQuestions = []; 

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
    
}

// Event listener for the restart button
document.getElementById('restartGame').addEventListener('click', restartGame);


// event listener to 'continueToNextQuestion' button
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

startTimer(10); 

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

  startQuizTimer(); 
});
