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

function parsePieceFromImgString(imgString) {
    const [color, piece] = imgString.split("/")[1].split(".")[0].split("-");
    return {
        color,
        piece
    }
}

function squareIsOccupied(square) {

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