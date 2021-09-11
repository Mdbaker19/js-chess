(() => {

    const board = $("#board");
    const body = $("body");

    function createBoard(){
        board.html("");
        for(let rows = 0; rows < 8; rows++) {
            for(let cols = 0; cols < 8; cols++) {
                board.append(square(rows, cols));
            }
        }
    }

    createBoard();

    function square(row, col) {
        let isBlack = (row + col) % 2 !== 0;
        let color = isBlack ? "#53382c" : "#8bb1c3";
        let squareAttr = isBlack ? "black" : "white";
        let square = document.createElement("div");
        let pieceType = pieceLetter(row, col);
        square.setAttribute("data-val", pieceType);
        square.setAttribute("sq-color", squareAttr);
        square.setAttribute("position", `${row}-${col}`);
        square.classList.add("square");
        square.innerHTML = pieceType;
        square.style.backgroundColor = color;
        square.style.width = "100px";
        square.style.height = "100px";
        return square;
    }

    function pieceLetter(row, col) {
        let prefix = row < 2 ? "b-" : "w-";
        if(row === 1 || row === 6) {
            return `<img src="img/${prefix}pawn.png">`;
        }
        if(row === 7 || row === 0) {
            if(col === 0 || col === 7) {
                return `<img src="img/${prefix}rook.png">`;
            }
            if(col === 1 || col === 6) {
                return `<img src="img/${prefix}knight.png">`;
            }
            if(col === 2 || col === 5) {
                return `<img src="img/${prefix}bishop.png">`;
            }

            // these need to change for white / black
            if(col === 3) {
                return `<img src="img/${prefix}queen.png">`;
            }
            if(col === 4) {
                return `<img src="img/${prefix}king.png">`;
            }
        }
        return "";
    }

    body.on("click", ".square", function () {
        let t = $(this);
        console.log(t);
        let pieceType = t.attr("data-val");
        let currentPosition = t.attr("position");
        // if(!moveTypeFromPiece(pieceType, currentPosition)) return;
        // console.log(pieceType);
        // console.log(currentPosition);
        moveTypeFromPiece(pieceType, currentPosition);
    });

    function moveTypeFromPiece(piece, currentPosition) {
        if(!piece) return false;
        let [row, col] = currentPosition.split("-");
        let movesList = generateMoves(piece, currentPosition, row, col);
        allowMoves(movesList, piece, row, col);
    }

    // so currently event bubbles....
    function allowMoves(movesList, piece, currRow, currCol) {
        movesList.forEach(move => {
            move.addEventListener("click", () => {
                move.innerHTML = piece;
                removePieceAndMoveHighlightFromPrevSquareAndUpdateDataSetVal(currCol, currRow, board, move);
                // need to count a turn
                // the dataSet value needs to be removed?
                // if i click on a square that was prev occupied by the pawn it thinks the
                // pawn is still there
            });
        });
    }

    function generateMoves(piece, currentPosition, currRow, currCol) {
        piece = parsePieceFromImgString(piece);
        // get all the squares, find the ones that have a position that is "reachable" add a appearance to them
        let allSquares = Array.from(document.getElementsByClassName("square"));
        let possibleMoves = [];
        for(let i = 0; i < allSquares.length; i++) {
            let currSquare = allSquares[i];

            // get the row and col for a potential target square
            let [thisRow, thisCol] = currSquare.getAttribute("position").split("-");
            let sqColor = currSquare.getAttribute("sq-color");

            // lets test for a pawn, light up and allow the forward movement, +1 row
            if(piece.piece === PIECES.PAWN) {
                // white pawn can move one up and only in this column
                if (piece.color === WHITE && +thisRow + 1 === +currRow && currCol === thisCol) {
                    let classToAdd = sqColor === "white" ? "can-move-to-white" : "can-move-to-black";
                    currSquare.classList.add(classToAdd);

                    // added to later be used to loop through for allowable clicks to transfer piece to
                    possibleMoves.push(currSquare);
                }
            }
        }
        return possibleMoves;
    }

})();