/*

===== Name
Highlight Legal Moves

===== Description
Use the <code class="js plain"><a href="docs.html#config:onMouseoverSquare">onMouseoverSquare</a></code> and <code class="js plain"><a href="docs.html#config:onMouseoutSquare">onMouseoutSquare</a></code> events to highlight legal squares.

===== HTML
<div id="myBoard" style="width: 400px"></div>


===== JS
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js
*/
var LETTER_COUNTS = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
};

var letters = [];
var board = null;
var boardToLetterMap = {};
var game = new Chess();
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";

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

  moveLetter(source, target);
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
}

function addLetter(square, letter) {
  var letterElement = `<div class="letter-${square}">${letter}</div>`;
  $(letterElement).appendTo("#myBoard .square-" + square);
  boardToLetterMap[square] = letter;
}

function removeLetter(square) {
  var existingLetter = $(`#myBoard .square-${square} .letter-${square}`);
  existingLetter?.remove();
  boardToLetterMap[square] = undefined;
}

function getLetter(square) {
  return boardToLetterMap[square];
}

function initializeLetterOptions() {
  letters = [];
  for (const letter in LETTER_COUNTS) {
    for (var i = 0; i < LETTER_COUNTS[letter]; i++) {
      letters.push(letter);
    }
  }
}

function popRandomLetter() {
  const index = Math.floor(Math.random() * letters.length);
  const letter = letters[index];
  letters.splice(index, 1); // Remove the item from the array
  return letter;
}

function initializeBoardWithLetters(board) {
  initializeLetterOptions();
  Object.keys(board.position()).forEach((square) =>
    addLetter(square, popRandomLetter())
  );
}

function moveLetter(source, target) {
  const letter = getLetter(source);
  removeLetter(target);
  removeLetter(source);
  addLetter(target, letter);
}

function findLetterInBoard(letter) {
  const positions = [];
  for (const position in boardToLetterMap) {
    if (
      boardToLetterMap[position] &&
      boardToLetterMap[position].toUpperCase() === letter.toUpperCase()
    ) {
      positions.push(position);
    }
  }
  return positions;
}

function convertBoardLocationToCoords(position) {
  const mapping = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8 };
  return { col: mapping[position[0]], row: position[1] };
}

function areCoordsAdjacent(position1, position2) {
  return (
    Math.abs(position1.row - position2.row) <= 1 &&
    Math.abs(position1.col - position2.col) <= 1
  );
}

function arePositionsAdjacent(position1, position2) {
  const coords1 = convertBoardLocationToCoords(position1);
  const coords2 = convertBoardLocationToCoords(position2);
  return areCoordsAdjacent(coords1, coords2);
}

function wordInBoard(word) {
  const stack = [];
  const firstLetterPositions = findLetterInBoard(word[0]);
  firstLetterPositions.forEach((position) => {
    stack.push([position]);
  });
  while (stack.length > 0) {
    const currentPath = stack.pop();
    if (currentPath.length === word.length) {
      return true;
    } else {
      const nextLetter = word[currentPath.length];
      const nextPositions = findLetterInBoard(nextLetter, board);
      nextPositions.forEach((position) => {
        if (
          arePositionsAdjacent(currentPath[currentPath.length - 1], position) &&
          !currentPath.find((pathPosition) => pathPosition === position)
        ) {
          stack.push([...currentPath, position]);
        }
      });
    }
  }
  return false;
}

function wordInDict(word) {
  return DICTIONARY.includes(word.toUpperCase());
}

function wordIsValid(word) {
  return word.length > 1 && wordInBoard(word) && wordInDict(word);
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
