import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  boardState: number[][] = [...Array(6)].map(() => Array(7).fill(0));
  currentPlayer: number = 1;
  rows = Array(6); // Creates an array with 6 elements
  cols = Array(7); // Creates an array with 7 elements
  playerInput: string = '';
  previewPiece: boolean = false;
  previewPieceStyle = {};
  showRestartButton: boolean = false;
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  dropPiece(colIndex: number) {
    for (let row = 5; row >= 0; row--) {
      if (this.boardState[row][colIndex] === 0) {
        this.boardState[row][colIndex] = this.currentPlayer;

        if (this.checkForWin(row, colIndex)) {
          // Handle win (e.g., display a message)
        } else if (this.checkForDraw()) {
          // Handle draw (e.g., display a message)
        }

        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        break;
      }
    }
  }

  checkForWin(row: number, col: number): boolean {
    // Horizontal check
    for (let j = 0; j < 4; j++) {
      if (col - j >= 0 &&
        this.boardState[row][col - j] === this.currentPlayer &&
        this.boardState[row][col - j + 1] === this.currentPlayer &&
        this.boardState[row][col - j + 2] === this.currentPlayer &&
        this.boardState[row][col - j + 3] === this.currentPlayer) {
        return true;
      }
    }

    // Vertical check
    if (row <= 2 &&
      this.boardState[row][col] === this.currentPlayer &&
      this.boardState[row + 1][col] === this.currentPlayer &&
      this.boardState[row + 2][col] === this.currentPlayer &&
      this.boardState[row + 3][col] === this.currentPlayer) {
      return true;
    }

    // Diagonal checks
    // Check Diagonally ↘
    for (let j = 0; j < 4; j++) {
      if (row + j <= 5 && col + j <= 6 &&
        this.boardState[row + j][col + j] === this.currentPlayer &&
        this.boardState[row + j - 1]?.[col + j - 1] === this.currentPlayer &&
        this.boardState[row + j - 2]?.[col + j - 2] === this.currentPlayer &&
        this.boardState[row + j - 3]?.[col + j - 3] === this.currentPlayer) {
        return true;
      }
    }

    // Check Diagonally ↙
    for (let j = 0; j < 4; j++) {
      if (row + j <= 5 && col - j >= 0 &&
        this.boardState[row + j][col - j] === this.currentPlayer &&
        this.boardState[row + j - 1]?.[col - j + 1] === this.currentPlayer &&
        this.boardState[row + j - 2]?.[col - j + 2] === this.currentPlayer &&
        this.boardState[row + j - 3]?.[col - j + 3] === this.currentPlayer) {
        return true;
      }
    }


    return false;
  }


  // Example of a draw check function
  checkForDraw(): boolean {
    // Check if all cells are filled and no win
    return this.boardState.every(row => row.every(cell => cell !== 0));
  }


  placePiece() {
    const { gridRow, gridColumn, gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd } = this.parseCSSInput(this.playerInput);

    // Use specific grid properties if available, otherwise fall back to simple ones
    const finalGridRow = gridRowStart ?? gridRow;
    const finalGridColumn = gridColumnStart ?? gridColumn;

    if (finalGridRow !== null && finalGridColumn !== null && this.isValidMove({ gridRow: finalGridRow, gridColumn: finalGridColumn })) {
      if (this.boardState[finalGridRow - 1][finalGridColumn - 1] === 0) {
        this.boardState[finalGridRow - 1][finalGridColumn - 1] = this.currentPlayer;

        this.cdr.detectChanges(); // Trigger change detection to update the UI
        const dropDistance = this.calculateDropDistance(finalGridRow, finalGridColumn);
        this.animatePieceDrop(finalGridRow, finalGridColumn, dropDistance);

        if (this.checkForWin(finalGridRow - 1, finalGridColumn - 1)) {
          setTimeout(() => this.showWinAlert(this.currentPlayer), 0); // Using setTimeout to allow the UI to update
        } else if (this.checkForDraw()) {
          // Handle draw
        }
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      }
    } else {
      alert("Invalid move. Please try again.");
    }
  }

  calculateDropDistance(gridRow: number, gridColumn: number): number {
    let emptyCells = 0;
    for (let row = 0; row < gridRow - 1; row++) {
      if (this.boardState[row][gridColumn - 1] === 0) {
        emptyCells++;
      }
    }
    return emptyCells;
  }

  animatePieceDrop(gridRow: number, gridColumn: number, dropDistance: number) {
      const pieceElement = document.querySelector(`#piece-${gridRow-1}-${gridColumn-1}`);
      if (pieceElement) {
        // Clear any existing animation
        pieceElement.classList.remove(...Array.from(pieceElement.classList).filter(c => c.startsWith('drop-from-')));

        // Add the new animation class
        const animationClass = `drop-from-${dropDistance}`;
        pieceElement.classList.add(animationClass);

        pieceElement.addEventListener('animationend', () => {
          pieceElement.classList.remove(animationClass);
        }, { once: true });
      }
  }



  showWinAlert(player: number) {
    alert(`Congratulations Player ${player}! You've won! 🎉`);
    // Call to display fireworks and show restart button
    this.displayFireworks();
    this.showRestartButton = true; // Assuming you have a variable to control the display of the restart button
  }

  displayFireworks() {
    // Logic to display fireworks (can be CSS animations or a library)
  }

  restartGame() {
    this.boardState = [...Array(6)].map(() => Array(7).fill(0));
    this.currentPlayer = 1;
    this.showRestartButton = false;

    const pieces = document.querySelectorAll('.piece');
    pieces.forEach(piece => {
      (piece as HTMLElement).style.animation = '';
      (piece as HTMLElement).style.transform = '';
    });
  }

  parseCSSInput(input: string): { gridRow: number | null, gridColumn: number | null, gridRowStart: number | null, gridRowEnd: number | null, gridColumnStart: number | null, gridColumnEnd: number | null } {
    const gridRowMatch = input.match(/grid-row:\s*(\d+)/);
    const gridColumnMatch = input.match(/grid-column:\s*(\d+)/);
    const gridRowStartMatch = input.match(/grid-row-start:\s*(\d+)/);
    const gridRowEndMatch = input.match(/grid-row-end:\s*(\d+)/);
    const gridColumnStartMatch = input.match(/grid-column-start:\s*(\d+)/);
    const gridColumnEndMatch = input.match(/grid-column-end:\s*(\d+)/);

    const gridRow = gridRowMatch ? parseInt(gridRowMatch[1]) : null;
    const gridColumn = gridColumnMatch ? parseInt(gridColumnMatch[1]) : null;
    const gridRowStart = gridRowStartMatch ? parseInt(gridRowStartMatch[1]) : null;
    const gridRowEnd = gridRowEndMatch ? parseInt(gridRowEndMatch[1]) : null;
    const gridColumnStart = gridColumnStartMatch ? parseInt(gridColumnStartMatch[1]) : null;
    const gridColumnEnd = gridColumnEndMatch ? parseInt(gridColumnEndMatch[1]) : null;

    return { gridRow, gridColumn, gridRowStart, gridRowEnd, gridColumnStart, gridColumnEnd };
  }




  isValidMove(cssProperties: { gridRow: number, gridColumn: number }): boolean {
    const { gridRow, gridColumn } = cssProperties;

    // Check if the row and column are within the board limits
    if (gridRow < 1 || gridRow > 6 || gridColumn < 1 || gridColumn > 7) {
      return false;
    }

    // Check if the chosen cell is empty
    if (this.boardState[gridRow - 1][gridColumn - 1] !== 0) {
      return false;
    }

    // Check if all cells below the chosen cell are filled (no empty cells below)
    for (let row = gridRow; row < 6; row++) {
      if (this.boardState[row][gridColumn - 1] === 0) {
        return false;
      }
    }

    return true;
  }





}
