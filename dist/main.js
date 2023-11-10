"use strict";
// Get the canvas element and its drawing context.
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Verify that the canvas context is available
if (!ctx) {
    throw new Error('Unable to get canvas context');
}
// 1. Game Variables
let gridSize = 3; // For a 4x4 slide puzzle
let tileSize;
let tiles = [];
let animationFrameId;
let gameStarted = false;
// 2. Utility functions
function shuffleTiles() {
    // Perform a number of valid moves to shuffle the tiles
    let blankPos = { row: gridSize - 1, col: gridSize - 1 }; // Start with the blank at the last position
    const shuffleMoves = 1000; // The number of moves to shuffle the board
    for (let i = 0; i < shuffleMoves; i++) {
        const possibleMoves = [
            [blankPos.row - 1, blankPos.col],
            [blankPos.row + 1, blankPos.col],
            [blankPos.row, blankPos.col - 1],
            [blankPos.row, blankPos.col + 1], // Right
        ].filter(([row, col]) => row >= 0 && row < gridSize && col >= 0 && col < gridSize);
        const [newRow, newCol] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        [tiles[blankPos.row][blankPos.col], tiles[newRow][newCol]] = [tiles[newRow][newCol], tiles[blankPos.row][blankPos.col]];
        blankPos = { row: newRow, col: newCol };
    }
}
function checkIfSolved() {
    let count = 1;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (row === gridSize - 1 && col === gridSize - 1) {
                if (tiles[row][col] !== 0) { // The last tile should be the empty space
                    return false;
                }
            }
            else {
                if (tiles[row][col] !== count) {
                    return false;
                }
                count++;
            }
        }
    }
    return true;
}
// Initialize the puzzle
function initPuzzle() {
    tiles = [];
    let num = 1;
    for (let row = 0; row < gridSize; row++) {
        let rowArray = [];
        for (let col = 0; col < gridSize; col++) {
            rowArray.push(num++);
        }
        tiles.push(rowArray);
    }
    // Set the last tile as the empty space
    tiles[gridSize - 1][gridSize - 1] = 0;
    // Shuffle the tiles using your preferred method
    shuffleTiles();
}
function resizeGame() {
    // Define the maximum canvas size
    const maxCanvasSize = Math.min(window.innerWidth, window.innerHeight, 500); // 500px or the viewport size, whichever is smaller
    // Set the canvas size
    canvas.width = maxCanvasSize;
    canvas.height = maxCanvasSize;
    // Update the tile size
    tileSize = maxCanvasSize / gridSize;
    // Redraw the game with new sizes
    render();
}
// Listen for resize events
window.addEventListener('resize', resizeGame);
function update() {
    // Update game logic (e.g., check if a puzzle piece has moved)
}
function drawTiles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    const cornerRadius = 10; // Set the desired corner radius here
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Define the position and size of the tile
            const x = col * tileSize;
            const y = row * tileSize;
            const width = tileSize;
            const height = tileSize;
            const tileValue = tiles[row][col];
            // Draw the rounded rectangle
            ctx.beginPath();
            ctx.moveTo(x + cornerRadius, y);
            ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
            ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
            ctx.arcTo(x, y + height, x, y, cornerRadius);
            ctx.arcTo(x, y, x + width, y, cornerRadius);
            ctx.closePath();
            // Fill the tile
            ctx.fillStyle = 'antiquewhite';
            ctx.fill();
            if (tileValue !== 0) {
                const sourceX = ((tileValue - 1) % gridSize) * (image.width / gridSize);
                const sourceY = Math.floor((tileValue - 1) / gridSize) * (image.height / gridSize);
                ctx.drawImage(image, sourceX, sourceY, image.width / gridSize, image.height / gridSize, col * tileSize, row * tileSize, tileSize, tileSize);
            }
            // Stroke the tile border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 10; // Set the stroke width
            ctx.stroke();
            // Draw the number on the tile if it is not the blank space
            if (tiles[row][col] !== 0) {
                ctx.fillStyle = 'burlywood';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.font = `${tileSize / 4}px serif`; // Example of dynamic font size
                ctx.fillText(tiles[row][col].toString(), x + tileSize / 2, y + tileSize / 2);
            }
        }
    }
}
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTiles();
}
function gameLoop() {
    update(); // Update game objects
    render(); // Render the game objects
    // Check if the puzzle is solved
    if (checkIfSolved()) {
        console.log("Puzzle solved!");
        const winningMessage = document.getElementById('winningMessage');
        if (winningMessage) {
            winningMessage.style.display = 'flex';
        } // Show the winning message
        cancelAnimationFrame(animationFrameId); // Use the stored ID to cancel the animation frame
    }
    else {
        animationFrameId = requestAnimationFrame(gameLoop); // Call the next frame
    }
}
function handleInput(event) {
    // Calculate the tile based on the click coordinates
    let x, y;
    if (event instanceof MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    }
    else if (event instanceof TouchEvent && event.touches) {
        event.preventDefault(); // Prevent scrolling and zooming on touch devices
        const touch = event.touches[0]; // Get the first touch
        const rect = canvas.getBoundingClientRect();
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    }
    else {
        return; // If the event is not a MouseEvent or TouchEvent with touches, exit the function
    }
    const clickedRow = Math.floor(y / tileSize);
    const clickedCol = Math.floor(x / tileSize);
    // Check if the clicked tile can move
    // Here we assume that the empty tile is represented by 0
    // And we only allow horizontal or vertical moves
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
        const newRow = clickedRow + dx;
        const newCol = clickedCol + dy;
        if (newRow >= 0 && newRow < tiles.length && newCol >= 0 && newCol < tiles[0].length && tiles[newRow][newCol] === 0) {
            // Swap the clicked tile with the empty tile
            [tiles[clickedRow][clickedCol], tiles[newRow][newCol]] = [tiles[newRow][newCol], tiles[clickedRow][clickedCol]];
            break;
        }
    }
}
// 3. Start game function
function startGame() {
    initPuzzle();
    resizeGame();
    gameLoop();
}
// 4. Image loading
const image = new Image();
image.src = 'assets/images/numg_1.png'; // Set the source to your image
image.onload = startGame;
// 5. Event listeners and game setup
document.addEventListener('DOMContentLoaded', function () {
    const startScreen = document.getElementById('startScreen');
    const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
    gridSizeButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (!gameStarted) {
                gridSize = parseInt(this.getAttribute('data-size') || '3');
                tileSize = canvas.width / gridSize;
                gameStarted = true; // Prevents multiple initializations
                // Hide the start screen and show the canvas
                if (startScreen) {
                    startScreen.style.display = 'none'; // Hide the start screen
                }
                canvas.style.display = 'block'; // Show the canvas
                startGame();
            }
        });
    });
    // Add event listeners for handling inputs
    canvas.addEventListener('click', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    // Initial resize of the game
    resizeGame();
});
