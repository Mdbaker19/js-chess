const PIECES = {
    PAWN: "pawn",
    ROOK: "rook",
    BISHOP: "bishop",
    KNIGHT: "knight",
    QUEEN: "queen",
    KING: "king"
}

const WHITE = "w";
const BLACK = "b";

// function square(row, col, pieceLetterInput = '') {
//     let isBlack = (row + col) % 2 !== 0;
//     let color = isBlack ? "#53382c" : "#8bb1c3";
//     let squareAttr = isBlack ? "black" : "white";
//     let square = document.createElement("div");
//     let pieceType = pieceLetterInput ? getPiece(pieceLetterInput) : pieceLetter(row, col);
//     square.setAttribute("data-val", pieceType);
//     square.setAttribute("sq-color", squareAttr);
//     square.setAttribute("position", `${row}-${col}`);
//     square.classList.add("square");
//     square.innerHTML = pieceType;
//     square.style.backgroundColor = color;
//     square.style.width = "100px";
//     square.style.height = "100px";
//     return square;
// }

function square(row, col, pieceLetterInput = '', fromPosition = false) {
    let isBlack = (row + col) % 2 !== 0;
    let color = isBlack ? "#53382c" : "#8bb1c3";
    let squareAttr = isBlack ? "black" : "white";
    let square = document.createElement("div");
    let pieceType = fromPosition ? getPiece(pieceLetterInput) : pieceLetter(row, col);
    square.setAttribute("data-val", pieceType);
    square.setAttribute("sq-color", squareAttr);
    square.setAttribute("position", `${row}-${col}`);
    square.classList.add("square");
    square.innerHTML = pieceType ? pieceType : '';
    square.style.backgroundColor = color;
    square.style.width = "100px";
    square.style.height = "100px";
    return square;
}

function getPiece(pieceInput) {
    let [color, pieceType] = pieceInput.split("_");

    switch (pieceType) {
        case "p":
            return `<img alt="piece" src="img/${color}pawn.png">`;
        case "r":
            return `<img alt="piece" src="img/${color}rook.png">`;
        case "n":
            return `<img alt="piece" src="img/${color}knight.png">`;
        case "b":
            return `<img alt="piece" src="img/${color}bishop.png">`;
        case "q":
            return `<img alt="piece" src="img/${color}queen.png">`;
        case "k":
            return `<img alt="piece" src="img/${color}king.png">`;
    }
}

function pieceLetter(row, col) {
    let prefix = row < 2 ? "b-" : "w-";
    if(row === 1 || row === 6) {
        return `<img alt="piece" src="img/${prefix}pawn.png">`;
    }
    if(row === 7 || row === 0) {
        if(col === 0 || col === 7) {
            return `<img alt="piece" src="img/${prefix}rook.png">`;
        }
        if(col === 1 || col === 6) {
            return `<img alt="piece" src="img/${prefix}knight.png">`;
        }
        if(col === 2 || col === 5) {
            return `<img alt="piece" src="img/${prefix}bishop.png">`;
        }

        // these need to change for white / black
        if(col === 3) {
            return `<img alt="piece" src="img/${prefix}queen.png">`;
        }
        if(col === 4) {
            return `<img alt="piece" src="img/${prefix}king.png">`;
        }
    }
    return "";
}

function parsePieceFromImgString(imgString) {
    const [color, piece] = imgString.split("/")[1].split(".")[0].split("-");
    return {
        color,
        piece
    }
}

function squareIsOccupied(square) {
    return square[0].dataset.val.length > 0;
}

function removePieceAndMoveHighlightFromPrevSquareAndUpdateDataSetVal(col, row, board, tgtSquare) {
    // get the board and turn to an 8x8 2d arr to then remove the prev html pic
    const boardData = board[0].children;
    let boardCopy = [];
    for(let i = 0; i < 8; i++) {
        let rowArr = [];
        for(let j = 0; j < 8; j++) {
            let boardIdx = i * 8 + j;
            rowArr.push(boardData[boardIdx]);
            removeHighlightClass(boardData[boardIdx]);
        }
        boardCopy.push(rowArr);
    }
    boardCopy[row][col].innerHTML = "";

    // remove this from the square you moved from, needs to be added to the square you went to...
    // this is the 'piece' in most of the functions, the html img tag

    // does not work, currently allows the pawn to just storm up the board, adding the highlight class to the next square
    // in line....
    // a new pawn can be created behind the one you just moved and that one can also move...wtf
    tgtSquare.dataset.val = boardCopy[row][col].dataset.val;
    boardCopy[row][col].dataset.val = "";
}

function removeHighlightClass(domSquare) {
    domSquare.classList.remove("can-move-to-black");
    domSquare.classList.remove("can-move-to-white");
}


function getPositionFromFen(board, fenString, fallBackFn) {
    board.html("");
    // from invalid username, call normal create board function
    if(!fenString) {
        fallBackFn(board);
        return -1;
    }
    console.log(fenString);
//   r4rk1/8/2p5/p3Pp2/PpQ4n/8/1PP2P2/2KR4
    let currentPieceFromFen = '';
    let fenIdx = 0;

    for(let rows = 0; rows < 8; rows++) {
        for(let cols = 0; cols < 8; cols++) {
            let curr = fenString[fenIdx];
            if(!curr) return;
            if(isNaN(parseInt(curr))) {
                if (curr === "/") {
                    fenIdx++;
                    continue;
                }
                currentPieceFromFen = curr === curr.toLowerCase()
                    ? `${BLACK}-_${curr}`
                    : `${WHITE}-_${curr.toLowerCase()}`;
                board.append(square(rows, cols, currentPieceFromFen, true));
            } else {
                let [newRows, newCols] = createBlankSquares(board, rows, cols, parseInt(curr));
                cols = newCols;
                rows = newRows;
            }
            console.log([rows, cols]);
            fenIdx++;
        }
    }

}

// i think the cols amount is not right when it leaves this recursive call...
// everytime a piece is hit the color messes up
function createBlankSquares(board, rows, cols, amountOfBlankSquares) {
    if(cols > 7) {
        cols = 0;
        rows++;
    }
    console.log([rows, cols]);
    if(amountOfBlankSquares <= 1) {
        board.append(square(rows, cols, '', true));
        return [rows, cols];
    }
    board.append(square(rows, cols, '', true));
    return createBlankSquares(board, rows, cols + 1, amountOfBlankSquares - 1);
}