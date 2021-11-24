let currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
let baseFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
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
    fenString = fenString.split("/").join("");
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








const PIECE_TABLE = {
    king: 'k',
    queen: 'q',
    bishop: 'b',
    rook: 'r',
    pawn: 'p',
    knight: 'n'
}

function readFenFromBoard(board) {
    console.log("GOAL: ", baseFen);
    // console.log("GOAL: ", pieceTestFen);
    let fen = "";
    let count = 0;
    let colCounter = 0; // if this >= 8 add the '/'
    const boardArr = board[0].childNodes;
    for(let i = 0; i < boardArr.length; i++) {
        colCounter++;
        if(colCounter === 9) {
            fen += '/';
            colCounter = 0;
        }
        let currSquare = boardArr[i];
        let potentialPiece = currSquare.dataset.val;
        if(potentialPiece !== 'undefined') {
            if(count !== 0) {
                fen += count;
                count = 0;
            }
            let [pieceColor, pieceType] = parseIt(potentialPiece); // [b, rook]
            fen +=  pieceColor === 'b'
                ? PIECE_TABLE[pieceType]
                : PIECE_TABLE[pieceType].toUpperCase();
        } else {
            count++;
            if(count === 8) {
                fen += count;
                count = 0;
            }
        }
    }
    return fen;
}


function parseIt(squareContent) {
    return squareContent.split(" ")[2].split("/")[1].split(".")[0].split("-");
}