function findLetterInBoard(letter) {
  const positions = [];
  for (const position in boardToLetterMap) {
    if (
      boardToLetterMap[position] &&
      board.position()[position] &&
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

function updateUsedWords(word) {
  usedWords.push(word);
  $("#usedWords").text(usedWords.join(", "));
}

function wordIsValid(word) {
  return (
    word.length > 1 &&
    !usedWords.includes(word) &&
    wordInBoard(word) &&
    wordInDict(word)
  );
}
