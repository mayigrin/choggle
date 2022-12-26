function convertFenToGrid(fen) {
  const arr = [
    ...fen.replace(/[/-8]/g, (c) => (+c ? " ".repeat(c) : "\n")),
  ].filter((x) => x != "\n");

  const board = new Array(8);
  for (let i = 0; i < 8; i++) {
    board[i] = arr.slice(i * 8, (i + 1) * 8);
  }
  return board;
}

function convertGridToFen(board) {
  let result = "";
  for (let y = 0; y < board.length; y++) {
    let empty = 0;
    for (let x = 0; x < board[y].length; x++) {
      let c = board[y][x]; // Fixed
      if (c != " ") {
        if (empty > 0) {
          result += empty.toString();
          empty = 0;
        }
        result += board[y][x];
      } else {
        empty += 1;
      }
    }
    if (empty > 0) {
      // Fixed
      result += empty.toString();
    }
    if (y < board.length - 1) {
      // Added to eliminate last '/'
      result += "/";
    }
  }
  return result;
}

function setValueInFen(fen, position, piece, color) {
  const board = convertFenToGrid(fen);
  const coords = convertBoardLocationToCoords(position);
  board[coords.row - 1][coords.col - 1] =
    color === "w" ? piece.toUpperCase() : piece.toLowerCase();
  return convertGridToFen(board);
}
