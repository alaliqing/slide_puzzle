// puzzle_controller.ts
import { NumPuzzle } from './num_puzzle.js';
import { ImagePuzzle } from './image_puzzle.js';
// Get the canvas element and its drawing context.
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    throw new Error('Cannot find element with id "gameCanvas"');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Cannot get 2D context from canvas');
}
let numPuzzle = new NumPuzzle(canvas, ctx);
let imagePuzzle = new ImagePuzzle(canvas, ctx);
const touchDelay = 42; // 100 ms delay
// Define an enumeration for game types
var GameType;
(function (GameType) {
    GameType[GameType["Number"] = 0] = "Number";
    GameType[GameType["Image"] = 1] = "Image";
})(GameType || (GameType = {}));
// 1. Game Variables
let gridSize = 3; // For a 4x4 slide puzzle
let gameStarted = false;
// Current game type state
let currentGameType = GameType.Number; // Default to number game
// Initialize puzzle
function initGame(gridSize) {
    if (currentGameType === GameType.Number) {
        numPuzzle.initPuzzle(gridSize);
        numPuzzle.resizeGame(gridSize);
        numPuzzle.gameLoop(gridSize);
    }
    else if (currentGameType === GameType.Image) {
        imagePuzzle.initPuzzle(gridSize);
        imagePuzzle.resizeGame(gridSize);
        imagePuzzle.gameLoop(gridSize);
    }
}
// Unified input handler
function handleInput(event) {
    if (currentGameType === GameType.Number) {
        numPuzzle.handleInput(event);
    }
    else {
        imagePuzzle.handleInput(event);
    }
}
function resizeGame(gridSize) {
    if (currentGameType === GameType.Number) {
        numPuzzle.resizeGame(gridSize);
    }
    else {
        imagePuzzle.resizeGame(gridSize);
    }
}
// Event listeners for the game
document.addEventListener('DOMContentLoaded', function () {
    const startScreen1 = document.getElementById('startScreen1');
    const startScreen2 = document.getElementById('startScreen2');
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');
    const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
    // Setup gameModeButtons event listeners
    gameModeButtons.forEach(button => {
        button.addEventListener('click', gameModeButtonClick);
        button.addEventListener('touchstart', gameModeButtonTouchStart);
    });
    // Handle click on gameModeButton
    function gameModeButtonClick() {
        handleGameModeSelection(this);
    }
    // Handle touchstart on gameModeButton
    function gameModeButtonTouchStart(event) {
        event.preventDefault();
        setTimeout(() => {
            handleGameModeSelection(this);
        }, touchDelay);
    }
    // Handle game mode selection
    function handleGameModeSelection(buttonElement) {
        const gameTypeCode = parseInt(buttonElement.getAttribute('game-mode') || '0');
        currentGameType = gameTypeCode === 0 ? GameType.Number : GameType.Image;
        if (startScreen1) {
            startScreen1.style.display = 'none'; // Hide the start1 screen
        }
        if (startScreen2) {
            startScreen2.style.display = 'flex'; // Show the start2 screen
        }
    }
    // Setup gridSizeButtons event listeners
    gridSizeButtons.forEach(button => {
        button.addEventListener('click', gridSizeButtonClick);
        button.addEventListener('touchstart', gridSizeButtonTouchStart);
    });
    // Handle click on gridSizeButton
    function gridSizeButtonClick(event) {
        handleGridSizeSelection(this, event);
    }
    // Handle touchstart on gridSizeButton
    function gridSizeButtonTouchStart(event) {
        event.preventDefault();
        setTimeout(() => {
            handleGridSizeSelection(this, event);
        }, touchDelay);
    }
    // Handle grid size selection
    function handleGridSizeSelection(buttonElement, event) {
        if (!gameStarted) {
            gridSize = parseInt(buttonElement.getAttribute('data-size') || '3');
            // tileSize = canvas.width / gridSize; // Uncomment if needed
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                if (startScreen2) {
                    startScreen2.style.display = 'none'; // Hide the start screen
                }
                canvas.style.display = 'block'; // Show the canvas
                initGame(gridSize);
            }
        }
    }
    // Add event listeners for handling inputs
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    // Initial resize of the game
    window.addEventListener('resize', () => resizeGame(gridSize));
    resizeGame(gridSize);
});
