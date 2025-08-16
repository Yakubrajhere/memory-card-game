// Memory Card Game Class
class MemoryGame {
    constructor() {
        // Game state variables
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.difficulty = 'easy';
        
        // Card symbols (numbers)
        this.cardSymbols = [
            '1', '2', '3', '4', '5', '6', 
            '7', '8', '9', '10', '11', '12'
        ];
        
        // Initialize the game
        this.initializeGame();
        this.setupEventListeners();
    }

    // Set up event listeners for difficulty buttons
    setupEventListeners() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelector('.difficulty-btn.active').classList.remove('active');
                // Add active class to clicked button
                e.target.classList.add('active');
                // Update difficulty and restart game
                this.difficulty = e.target.dataset.difficulty;
                this.initializeGame();
            });
        });
    }

    // Initialize/restart the game
    initializeGame() {
        this.resetGameState();
        this.createGameBoard();
    }

    // Reset all game state variables
    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameActive = false;
        
        // Clear existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Update display
        this.updateStats();
        document.getElementById('victoryModal').classList.remove('show');
    }

    // Create the game board based on difficulty
    createGameBoard() {
        const container = document.getElementById('gameContainer');
        container.className = `game-container ${this.difficulty}`;
        container.innerHTML = '';

        // Define number of pairs for each difficulty
        const cardCounts = {
            easy: 6,    // 4x3 = 12 cards, 6 pairs
            medium: 8,  // 4x4 = 16 cards, 8 pairs
            hard: 12    // 6x4 = 24 cards, 12 pairs
        };

        const pairCount = cardCounts[this.difficulty];
        const gameSymbols = this.cardSymbols.slice(0, pairCount);
        
        // Create pairs (duplicate each symbol)
        this.cards = [...gameSymbols, ...gameSymbols];
        // Shuffle the cards
        this.shuffleArray(this.cards);

        // Create card elements and add to container
        this.cards.forEach((symbol, index) => {
            const cardElement = this.createCardElement(symbol, index);
            container.appendChild(cardElement);
        });
    }

    // Create individual card element
    createCardElement(symbol, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;

        // Create card faces (front and back)
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${symbol}</div>
        `;

        // Add click event listener
        card.addEventListener('click', () => this.handleCardClick(card));
        return card;
    }

    // Handle card click events
    handleCardClick(card) {
        // Start timer on first click
        if (!this.gameActive) {
            this.startTimer();
            this.gameActive = true;
        }

        // Prevent clicking if:
        // - Two cards are already flipped
        // - Card is already flipped
        // - Card is already matched
        if (this.flippedCards.length >= 2 || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched')) {
            return;
        }

        // Flip the card
        card.classList.add('flipped');
        this.flippedCards.push(card);

        // Check for match when two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkForMatch();
        }
    }

    // Check if two flipped cards match
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.symbol === card2.dataset.symbol;

        // Delay to show both cards before hiding/matching
        setTimeout(() => {
            if (isMatch) {
                // Cards match - mark as matched
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedPairs++;
                this.updateStats();
                this.checkWinCondition();
            } else {
                // Cards don't match - flip back
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }
            
            // Clear flipped cards array
            this.flippedCards = [];
        }, 1000);
    }

    // Check if player has won the game
    checkWinCondition() {
        const totalPairs = {
            easy: 6,
            medium: 8,
            hard: 12
        };

        // Check if all pairs are matched
        if (this.matchedPairs === totalPairs[this.difficulty]) {
            this.gameActive = false;
            clearInterval(this.timerInterval);
            this.showVictoryModal();
        }
    }

    // Show victory modal with game stats
    showVictoryModal() {
        const modal = document.getElementById('victoryModal');
        const stats = document.getElementById('victoryStats');
        const timeDisplay = document.getElementById('timer').textContent;
        
        // Display final stats
        stats.innerHTML = `
            <p>Time: ${timeDisplay}</p>
            <p>Moves: ${this.moves}</p>
            <p>Difficulty: ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}</p>
        `;
        
        modal.classList.add('show');
    }

    // Start the game timer
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    // Update game statistics display
    updateStats() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('matches').textContent = this.matchedPairs;
        
        // Reset timer display if game is not active
        if (!this.gameActive && this.moves === 0) {
            document.getElementById('timer').textContent = '00:00';
        }
    }

    // Shuffle array using Fisher-Yates algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Global game variable
let game;

// Reset game function (called by reset button)
function resetGame() {
    game = new MemoryGame();
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new MemoryGame();
});