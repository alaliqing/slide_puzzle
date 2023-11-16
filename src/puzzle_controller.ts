// puzzle_controller.ts
import { NumPuzzle } from './num_puzzle.js';
import { ImagePuzzle } from './image_puzzle.js';

// Get the canvas element and its drawing context.
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Cannot find element with id "gameCanvas"');
}
const ctx = canvas.getContext('2d')!;
if (!ctx) {
    throw new Error('Cannot get 2D context from canvas');
}

let numPuzzle = new NumPuzzle(canvas, ctx);
let imagePuzzle = new ImagePuzzle(canvas, ctx);

// Define an enumeration for game types
enum GameType {
    Number,
    Image
}

// 1. Game Variables
let gridSize = 3; // For a 4x4 slide puzzle
let gameStarted = false;

// Current game type state
let currentGameType: GameType = GameType.Number; // Default to number game

// Initialize puzzle
function initGame(gridSize: number, image: HTMLImageElement) {
    if (currentGameType === GameType.Number) {
        numPuzzle.initPuzzle(gridSize);
        numPuzzle.resizeGame(gridSize);
        numPuzzle.gameLoop(gridSize);
    } else if (currentGameType === GameType.Image) {
        image.onload = () => imagePuzzle.initPuzzle(gridSize); 
        imagePuzzle.initPuzzle(gridSize);
        imagePuzzle.resizeGame(gridSize, image);
        imagePuzzle.gameLoop(gridSize, image);
    }
}

// Unified input handler
function handleInput(event: MouseEvent | TouchEvent) {
    if (currentGameType === GameType.Number) {
        numPuzzle.handleInput(event);
    } else {
        imagePuzzle.handleInput(event);
    }
}

function resizeGame(gridSize: number, image: HTMLImageElement) {
    if (currentGameType === GameType.Number) {
        numPuzzle.resizeGame(gridSize);
    } else {
        imagePuzzle.resizeGame(gridSize, image);
    }
}

// Event listeners for the game
const image = new Image();
image.src = 'assets/images/numg_3.png'; // Set the source to your image

document.addEventListener('DOMContentLoaded', function () {
    const startScreen1 = document.getElementById('startScreen1');
    const gameModeButtons = document.querySelectorAll('.game-mode-btn');

    gameModeButtons.forEach(button => {
        button.addEventListener('click', function (this: HTMLElement) {
            const gameTypeCode = parseInt(this.getAttribute('game-mode') || '0'); // Add null check and default value
            currentGameType = gameTypeCode === 0 ? GameType.Number : GameType.Image;
            // if (currentGameType === GameType.Image) {
            //     image.onload = () => initGame(gridSize, image); // Call initGame with gridSize and image
            // }
            // Hide the start screen and show the canvas
            if (startScreen1) {
                startScreen1.style.display = 'none'; // Hide the start1 screen
            }
            const startScreen2 = document.getElementById('startScreen2');
            const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
            if (startScreen2) {
                startScreen2.style.display = 'block'; // Show the start2 screen
            }
            gridSizeButtons.forEach(button => {
                button.addEventListener('click', function (this: HTMLElement) {
                    if (!gameStarted) {
                        gridSize = parseInt(this.getAttribute('data-size') || '3'); // Add null check and default value
                        // tileSize = canvas.width / gridSize; // Update tile size based on selected grid size

                        // Hide the start screen and show the canvas
                        if (startScreen2) {
                            startScreen2.style.display = 'none'; // Hide the start screen
                        }
                        canvas.style.display = 'block'; // Show the canvas
                        initGame(gridSize, image); // Initialize the puzzle with the new grid size
                    }
                });
            });
        });
    });
    // Add event listeners for handling inputs
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);

    // Initial resize of the game
    window.addEventListener('resize', () => resizeGame(gridSize, image));
    resizeGame(gridSize, image);
});