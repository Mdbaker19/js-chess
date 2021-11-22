(() => {

    const board = $("#board");
    const body = $("body");
    let turn = 0;
    let cache = [];
    let gameData = [];
    let idx = 0;
    let notActive = true;

    let whoAndWho = document.getElementById("whoAndWho");
    let next = document.getElementById("next");
    let prev = document.getElementById("prev");
    let gameIdx = document.getElementById("gameIdx");
    let userNameInput = document.getElementById("username");
    document.getElementById("submit").addEventListener("click", () => {
        submit();

    });

    window.addEventListener("keydown", e => {
        if(e.key === "Enter") {
            submit();
        }
    });

    function submit() {
        let input = userNameInput.value;
        if(input.trim().length > 0) {
            // need to validate the response, valid username with chess.com and valid games
            // TODO: this is causing event bubbling...... need to clean up the logic
            init(input).then(buttons);
        } else {
            console.log("enter a user name");
        }
    }

    // TODO: SOME IDX RESETTING OUTSIDE THIS AND USE THIS BOOL TO PREVENT BUBBLING...for now..
    function buttons() {
        if(notActive) {
            let res = getPositionFromFen(board, cache[idx], createBoard);
            if(res === -1) {
                document.getElementById("loading").innerText = "not found";
                return;
            }
            document.getElementById("loading").style.display = "none";
            next.addEventListener("click", () => {
                idx++;
                idx %= cache.length;
                getPositionFromFen(board, cache[idx]);
                gameIdx.innerText = (idx + 1).toString();
                whoAndWho.innerText = gameData[idx];
            });
            prev.addEventListener("click", () => {
                idx--;
                idx = idx < 0 ? cache.length - 1 : idx;
                getPositionFromFen(board, cache[idx]);
                gameIdx.innerText = (idx + 1).toString();
                whoAndWho.innerText = gameData[idx];
            });
            gameIdx.innerText = (idx + 1).toString();
            whoAndWho.innerText = gameData[idx];
        }
        notActive = false; // fix?
        console.log("Ready");
    }

    function createBoard(){
        board.html("");
        for(let rows = 0; rows < 8; rows++) {
            for(let cols = 0; cols < 8; cols++) {
                board.append(square(rows, cols));
            }
        }
    }

    createBoard();
    function url(name) {
        return `https://api.chess.com/pub/player/${name}/games`;
    }

    async function init(name) {
        cache = [];
        gameData = [];
        const games = await getData(name);
        games.forEach(game => {
            cache.push(formatFen(game.fen));
            gameData.push(getPlayerNames(game.white.split("/"), game.black.split("/")));
        });
        return cache;
    }

    function formatFen(fen) {
        return fen.split(" ")[0];
    }

    // get the colors to for each
    function getPlayerNames(nameString1, nameString2) {
        let one = nameString1[nameString1.length - 1];
        let two = nameString2[nameString2.length - 1];
        return `${one} as W and ${two} as B`;
    }

    function getData(name) {
        return fetch(url(name)).then(res => res.json().then(data => {
            return data.games
        }));
    }

    // getPositionFromFen(board, 'r4rk1/8/2p5/p3Pp2/PpQ4n/8/1PP2P2/2KR4');




    /* this is the potential cause for the moves, as I click a "new" square
        that square now has the html assigned to it, the piece that was just moved to it
        and now there are possible moves for that piece
        --maybe a turn handler will fix this?
    */
    body.on("click", ".square", function () {
        let t = $(this);

        // will use later
        console.log(squareIsOccupied(t));


        turn++;
        if(turn % 2 === 0) return; // blacks turn instead so same ish logic just
                                    // a shitty fix for the constant movement problem

        // this can be passed into the moveTypeFromPiece instead to generate moves for black rather

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
        console.log(movesList);
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

            let data = {currSquare, thisRow, thisCol, sqColor, currRow, currCol};

            // move comes back valid ? use it or skip
            let move = moveOptionsByPiece(piece, data);
            move ? possibleMoves.push(move) : undefined;

        }
        return possibleMoves;
    }

    // others require square blocking check
    function moveOptionsByPiece(piece, data) {
        switch (piece.piece) {
            case PIECES.PAWN:
                return pawnMoveWhiteTest(piece, data);
            case PIECES.ROOK:
                return;
            case PIECES.KNIGHT:
                return knightMoveTest(piece, data);
            case PIECES.BISHOP:
                return;
            case PIECES.QUEEN:
                return;
            case PIECES.KING:
                return;
        }
    }

    function knightMoveTest(piece, data) {
        /* for wherever a knight is
            it's moves are based of bounds on the board
            create the 8 moves, add the ones within bounds to the return
            if anything over 7 x 7 do not add
            take the current square and loop again... n^2 just in this
            find squares with
        */

        console.log(data.currSquare.getAttribute("position"));
        let allSquares = Array.from(document.getElementsByClassName("square"));

        for(let i = 0; i < allSquares.length; i++) {
            let curr = allSquares[i];
            let position = curr.getAttribute("position");
        }

    }

    function pawnMoveWhiteTest(piece, data){
        // if curr square is still starting and no obstruction, allow for double push start

        // white pawn can move one up and only in this column
        if (piece.color === WHITE && +data.thisRow + 1 === +data.currRow && data.currCol === data.thisCol) {
            let classToAdd = data.sqColor === "white" ? "can-move-to-white" : "can-move-to-black";
            data.currSquare.classList.add(classToAdd);

            // added to later be used to loop through for allowable clicks to transfer piece to
            return data.currSquare;
        }
    }

})();
