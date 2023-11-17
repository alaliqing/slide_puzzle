// image_puzzle.ts
export class ImagePuzzle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileSize = 0;
        this.tiles = [];
        this.animationFrameId = 0;
        this.image = new Image();
        this.image.src = 'assets/images/20231117-154829.jpg'; // Set the source to image
        if (!this.ctx) {
            throw new Error('Unable to get thi.canvas context');
        }
    }
    // 2. Utility functions
    shuffleTiles(gridSize) {
        // Perform a number of valid moves to shuffle the this.tiles
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
        this.tiles = [];
        let num = 1;
        for (let row = 0; row < gridSize; row++) {
            let rowArray = [];
            for (let col = 0; col < gridSize; col++) {
                rowArray.push(num++);
            }
            this.tiles.push(rowArray);
        }
        // Set the last tile as the empty space
        this.tiles[gridSize - 1][gridSize - 1] = 0;
        // Shuffle the this.tiles using your preferred method
        this.shuffleTiles(gridSize);
    }
    resizeGame(gridSize) {
        // Define the maximum thi.canvas size
        const maxCanvasSize = Math.min(window.innerWidth, window.innerHeight, 500); // 500px or the viewport size, whichever is smaller
        // Set the thi.canvas size
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the entire thi.canvas
        const cornerRadius = 10; // Set the desired corner radius here
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                // Define the position and size of the tile
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                const width = this.tileSize;
                const height = this.tileSize;
                const tileValue = this.tiles[row][col];
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
                if (tileValue !== 0) {
                    const sourceX = ((tileValue - 1) % gridSize) * (this.image.width / gridSize);
                    const sourceY = Math.floor((tileValue - 1) / gridSize) * (this.image.height / gridSize);
                    this.ctx.drawImage(this.image, sourceX, sourceY, this.image.width / gridSize, this.image.height / gridSize, col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
                }
                // Stroke the tile border
                this.ctx.strokeStyle = 'antiquewhite';
                this.ctx.lineWidth = 24 / gridSize; // Set the stroke width
                this.ctx.stroke();
                // Draw the number on the tile if it is not the blank space
                if (this.tiles[row][col] !== 0) {
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillStyle = 'white';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.textAlign = 'center';
                    this.ctx.font = `bold ${this.tileSize / 3}px serif`; // Example of dynamic font size
                    this.ctx.fillText(this.tiles[row][col].toString(), x + this.tileSize / 2, y + this.tileSize / 2);
                    this.ctx.globalAlpha = 1.0;
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
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop(gridSize)); // Call the next frame
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
// // 3. Start game function
// function startGame() {
//     initPuzzle();
//     resizeGame();
//     gameLoop();
// }
// // 4. Image loading
// const image = new Image();
// image.src = 'assets/images/numg_1.png'; // Set the source to your image
// image.onload = startGame;
// // 5. Event listeners and game setup
// document.addEventListener('DOMContentLoaded', function () {
//     const startScreen = document.getElementById('startScreen');
//     const gridSizeButtons = document.querySelectorAll('.grid-size-btn');
//     gridSizeButtons.forEach(button => {
//         button.addEventListener('click', function (this: HTMLElement) {
//             if (!gameStarted) {
//                 gridSize = parseInt(this.getAttribute('data-size') || '3');
//                 this.this.tileSize = thi.canvas.width / gridSize;
//                 gameStarted = true; // Prevents multiple initializations
//                 // Hide the start screen and show the thi.canvas
//                 if (startScreen) {
//                     startScreen.style.display = 'none'; // Hide the start screen
//                 }
//                 thi.canvas.style.display = 'block'; // Show the thi.canvas
//                 startGame();
//             }
//         });
//     });
//     // Add event listeners for handling inputs
//     thi.canvas.addEventListener('click', handleInput);
//     thi.canvas.addEventListener('touchstart', handleInput);
//     // Initial resize of the game
//     resizeGame();
// });
