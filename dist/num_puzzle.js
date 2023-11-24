// num_puzzle.ts
export class NumPuzzle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileSize = 0;
        this.tiles = [];
        this.animationFrameId = 0;
        if (!this.ctx) {
            throw new Error('Unable to get canvas context');
        }
    }
    // Utility functions
    shuffleTiles(gridSize) {
        // Perform a number of valid moves to shuffle the this.tiles
        let blankPos = { row: gridSize - 1, col: gridSize - 1 }; // Start with the blank at the last position
        const shuffleMoves = 1000; // The number of moves to shuffle the board
        for (let i = 0; i < shuffleMoves; i++) {
            const possibleMoves = [
                [blankPos.row - 1, blankPos.col],
                [blankPos.row + 1, blankPos.col],
                [blankPos.row, blankPos.col - 1],
                [blankPos.row, blankPos.col + 1],
            ].filter(([row, col]) => row >= 0 && row < gridSize && col >= 0 && col < gridSize);
            const [newRow, newCol] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            [this.tiles[blankPos.row][blankPos.col], this.tiles[newRow][newCol]] = [this.tiles[newRow][newCol], this.tiles[blankPos.row][blankPos.col]];
            blankPos = { row: newRow, col: newCol };
        }
    }
    checkIfSolved(gridSize) {
        let count = 1;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (row === gridSize - 1 && col === gridSize - 1) {
                    if (this.tiles[row][col] !== 0) { // The last tile should be the empty space
                        return false;
                    }
                }
                else {
                    if (this.tiles[row][col] !== count) {
                        return false;
                    }
                    count++;
                }
            }
        }
        return true;
    }
    // Initialize the puzzle
    initPuzzle(gridSize) {
        this.tiles = [...Array(gridSize)].map((_, row) => [...Array(gridSize)].map((_, col) => row * gridSize + col));
        // Shuffle the this.tiles using your preferred method
        this.shuffleTiles(gridSize);
    }
    resizeGame(gridSize) {
        // Define the maximum canvas size
        const maxCanvasSize = Math.min(window.innerWidth, window.innerHeight, 500); // 500px or the viewport size, whichever is smaller
        // Set the canvas size
        this.canvas.width = maxCanvasSize;
        this.canvas.height = maxCanvasSize;
        // Update the tile size
        this.tileSize = maxCanvasSize / gridSize;
        // Redraw the game with new sizes
        this.render(gridSize);
    }
    update() {
        // Update game logic (e.g., check if a puzzle piece has moved)
    }
    drawTiles(gridSize) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the entire canvas
        const cornerRadius = 10; // Set the desired corner radius here
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                // Define the position and size of the tile
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                const width = this.tileSize;
                const height = this.tileSize;
                // Draw the rounded rectangle
                this.ctx.beginPath();
                this.ctx.moveTo(x + cornerRadius, y);
                this.ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
                this.ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
                this.ctx.arcTo(x, y + height, x, y, cornerRadius);
                this.ctx.arcTo(x, y, x + width, y, cornerRadius);
                this.ctx.closePath();
                // Fill the tile
                this.ctx.fillStyle = 'antiquewhite';
                this.ctx.fill();
                // Stroke the tile border
                this.ctx.strokeStyle = 'white';
                this.ctx.lineWidth = 5; // Set the stroke width
                this.ctx.stroke();
                // Draw the number on the tile if it is not the blank space
                if (this.tiles[row][col] !== 0) {
                    this.ctx.fillStyle = 'burlywood';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.textAlign = 'center';
                    this.ctx.font = `${this.tileSize / 4}px serif`; // Example of dynamic font size
                    this.ctx.fillText(this.tiles[row][col].toString(), x + this.tileSize / 2, y + this.tileSize / 2);
                }
            }
        }
    }
    render(gridSize) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTiles(gridSize);
    }
    gameLoop(gridSize) {
        this.update(); // Update game objects
        this.render(gridSize); // Render the game objects
        // Check if the puzzle is solved
        if (this.checkIfSolved(gridSize)) {
            console.log("Puzzle solved!");
            const winningMessage = document.getElementById('winningMessage');
            if (winningMessage) {
                winningMessage.style.display = 'flex';
            } // Show the winning message
            cancelAnimationFrame(this.animationFrameId); // Use the stored ID to cancel the animation frame
        }
        else {
            this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this, gridSize)); // Call the next frame
        }
    }
    handleInput(event) {
        // Calculate the tile based on the click coordinates
        let x, y;
        if (event instanceof MouseEvent) {
            const rect = this.canvas.getBoundingClientRect();
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        else if (event instanceof TouchEvent && event.touches) {
            event.preventDefault(); // Prevent scrolling and zooming on touch devices
            const touch = event.touches[0]; // Get the first touch
            const rect = this.canvas.getBoundingClientRect();
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        }
        else {
            return; // If the event is not a MouseEvent or TouchEvent with touches, exit the function
        }
        const clickedRow = Math.floor(y / this.tileSize);
        const clickedCol = Math.floor(x / this.tileSize);
        // Check if the clicked tile can move
        // Here we assume that the empty tile is represented by 0
        // And we only allow horizontal or vertical moves
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const newRow = clickedRow + dx;
            const newCol = clickedCol + dy;
            if (newRow >= 0 && newRow < this.tiles.length && newCol >= 0 && newCol < this.tiles[0].length && this.tiles[newRow][newCol] === 0) {
                // Swap the clicked tile with the empty tile
                [this.tiles[clickedRow][clickedCol], this.tiles[newRow][newCol]] = [this.tiles[newRow][newCol], this.tiles[clickedRow][clickedCol]];
                break;
            }
        }
    }
}
// document.addEventListener('DOMContentLoaded', function () {
//     const startScreen = document.getElementById('startScreen');
//     const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
//     gridSizeButtons.forEach(button => {
//         button.addEventListener('click', function (this: HTMLElement) {
//             gridSize = parseInt(this.getAttribute('data-size') || '3'); // Add null check and default value
//             this.tileSize = canvas.width / gridSize; // Update tile size based on selected grid size
//             // Hide the start screen and show the canvas
//             if (startScreen) {
//                 startScreen.style.display = 'none'; // Hide the start screen
//             }
//             canvas.style.display = 'block'; // Show the canvas
//             initPuzzle(); // Initialize the puzzle with the new grid size
//             resizeGame(); // Resize the game to fit the new grid size
//             gameLoop(); // Start the game loop
//         });
//     });
//     // Add event listeners for handling inputs
//     canvas.addEventListener('click', handleInput);
//     canvas.addEventListener('touchstart', handleInput);
//     // Initial resize of the game
//     resizeGame();
// });
