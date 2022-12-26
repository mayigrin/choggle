// ==== Chess UI & Logic ====

function removeGreySquares() {
  $("#myBoard .square-55d63").css("background", "");
}

function greySquare(square) {
  var $square = $("#myBoard .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function onDragStart(source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // or if it's not that side's turn
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  board.position(game.fen());
  saveGameState();
  switchTurnUI(game.turn());
}

function saveGameState() {
  gameStates.push(game.fen());
  updateLetters();
}

// ==== Letter Handling ====

function addLetter(square, letter) {
  var letterElement = `<div class="letter-${square}">${letter}</div>`;
  $(letterElement).appendTo("#myBoard .square-" + square);
  boardToLetterMap[square] = letter;
}

function showLetter(square) {
  var existingLetter = $(`#myBoard .square-${square} .letter-${square}`);
  existingLetter?.show();
}

function hideLetter(square) {
  var existingLetter = $(`#myBoard .square-${square} .letter-${square}`);
  existingLetter?.hide();
}

function updateLetters() {
  ["a", "b", "c", "d", "e", "f", "g", "h"].forEach((col) => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((row) => {
      const square = `${col}${row}`;
      if (board.position()[square]) {
        showLetter(square);
      } else {
        hideLetter(square);
      }
    });
  });
}

function popRandomLetter() {
  const index = Math.floor(Math.random() * letters.length);
  const letter = letters[index];
  letters.splice(index, 1); // Remove the item from the array
  return letter;
}

function initializeLetterOptions() {
  letters = [];
  for (const letter in LETTER_COUNTS) {
    for (var i = 0; i < LETTER_COUNTS[letter]; i++) {
      letters.push(letter);
    }
  }
}

function initializeBoardWithLetters(board) {
  initializeLetterOptions();
  ["a", "b", "c", "d", "e", "f", "g", "h"].forEach((col) => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((row) => {
      const square = `${col}${row}`;
      addLetter(square, popRandomLetter());
    });
  });
  saveGameState();
}

// ==== UI Management ====

function switchTurnUI(switchTo) {
  if (switchTo === "w") {
    $("#wordInputContainer").css("top", "95%");
  } else {
    $("#wordInputContainer").css("top", "10%");
  }
  $("#wordInput").val("");
}

function updateUndosUI() {
  $("#undoCounter-w").text(undos.w);
  $("#undoCounter-b").text(undos.b);
}

function incrementUndo() {
  undos[game.turn()] += 1;
  updateUndosUI();
}

function undo() {
  gameStates.pop();
  game.load(gameStates[gameStates.length - 1]);
  board.position(game.fen());
  updateLetters();
  return game.fen().split(" ")[1];
}

function whiteUndo() {
  if (undos.w > 0 && gameStates.length > 1) {
    undos.w -= 1;
    updateUndosUI();
    const current_turn = undo();
    switchTurnUI(current_turn);
  }
}

function blackUndo() {
  if (undos.b > 0 && gameStates.length > 1) {
    undos.b -= 1;
    updateUndosUI();
    const current_turn = undo();
    switchTurnUI(current_turn);
  }
}

function switchTurn() {
  let tokens = game.fen().split(" ");
  tokens[1] = tokens[1] === "w" ? "b" : "w";
  game.load(tokens.join(" "));

  switchTurnUI(tokens[1]);
}

function submitWord() {
  var word = $("#wordInput").val().toUpperCase();
  const valid = wordIsValid(word);

  if (valid) {
    $("#valid-word").show();
    $("#wordInput").css("background-color", "#c0f0cd");
    setTimeout(() => {
      updateUsedWords(word);
      getReward(word.length);
      $("#valid-word").hide();
      $("#wordInput").css("background-color", "unset");
    }, 1000);
  } else {
    $("#invalid-word").show();
    $("#wordInput").css("background-color", "#f0c0c0");
    setTimeout(() => {
      $("#invalid-word").hide();
      $("#wordInput").css("background-color", "unset");
      switchTurn();
    }, 1000);
  }
}

function modifySquareInGame(position, piece, color) {
  const tokens = game.fen().split(" ");
  const newFen = setValueInFen(tokens[0], position, piece, color);
  tokens[0] = newFen;
  console.log(tokens.join(" "));
  game.load(tokens.join(" "));
  board.position(game.fen());
  saveGameState();
}

function getReward(length) {
  incrementUndo();
  switchTurn();
  return;
}

var config = {
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board = Chessboard("myBoard", config);
initializeBoardWithLetters(board);
