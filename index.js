(() => {
    const board = $("#board");
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

    document.getElementById("changeMe").addEventListener("click", () => {
        whiteColor = whiteColorInput.value;
        blackColor = blackColorInput.value;
        getPositionFromFen(board, currentFen, createBoard);
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

    getPositionFromFen(board, pieceTestFen, createBoard);

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

})();
