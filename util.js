let currentFen = "rbnqknbr/pppppppp/8/8/8/8/PPPPPPPP/RBNQKNBR";
let pieceTestFen = "8/pb3k2/1PBn4/8/8/Q7/6r1/8"
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

let blackColorInput = document.getElementById("black-color");
let blackColor = blackColorInput.value;
let whiteColorInput = document.getElementById("white-color");
let whiteColor = whiteColorInput.value;

function square(row, col, pieceLetterInput = '') {
    let isBlack = (row + col) % 2 !== 0;
    console.log(blackColor, whiteColor);
    let color = isBlack ? blackColor : whiteColor;
    let squareAttr = isBlack ? "black" : "white";
    let square = document.createElement("div");
    let pieceType = getPiece(pieceLetterInput);
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



function getPositionFromFen(board, fenString, fallBackFn) {
    board.html("");
    fenString = fenString.split("/").reverse().join("");
    // from invalid username, call normal create board function
    if(!fenString) {
        fallBackFn(board);
        return -1;
    }
    currentFen = fenString;
    let currentPieceFromFen = '';
    let fenIdx = 0;

    for(let rows = 0; rows < 8; rows++) {
        for(let cols = 0; cols < 8; cols++) {
            let curr = fenString[fenIdx];
            if(!curr) return;
            if(isNaN(parseInt(curr))) {
                currentPieceFromFen = curr === curr.toLowerCase()
                    ? `${BLACK}-_${curr}`
                    : `${WHITE}-_${curr.toLowerCase()}`;
                board.append(square(rows, cols, currentPieceFromFen));
            } else {
                let [newRows, newCols] = createBlankSquares(board, rows, cols, parseInt(curr));
                cols = newCols;
                rows = newRows;
            }
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
    if(amountOfBlankSquares <= 1) {
        board.append(square(rows, cols, ''));
        return [rows, cols];
    }
    board.append(square(rows, cols, ''));
    return createBlankSquares(board, rows, cols + 1, amountOfBlankSquares - 1);
}

// after notes are submitted by the user, save the FEN, possibly to a DB or something by user