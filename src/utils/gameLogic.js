// Function to determine the number of colors to generate based on the players current level
const getNumColorsForLevel = (level) => {
  if (level <= 5) return 6;
  if (level <= 14) return 7;
  if (level <= 24) return 8;
  if (level <= 39) return 9;
  return 10;
};

// Generates a puzzle
export function generatePuzzle(
  level,
  randomDifficulty = false,
  piecesPerTube = 4,
  emptyTubes = 2
) {
  // Select number of colors to generate if Randome Difficulty Mode is enabled, generates random number
  const numColors = randomDifficulty
    ? [6, 7, 8, 9, 10][Math.floor(Math.random() * 5)] // Random selection from 6-10 colors
    : getNumColorsForLevel(level); // Default behavior, determines number of colors based on player level

  let tubes = [];
  let allColors = [];

  for (let i = 0; i < numColors; i++) {
    let color = `Color${i + 1}`;
    allColors.push(...new Array(piecesPerTube).fill(color)); // Collect all pieces
  }

  // Shuffles all game pieces randomly
  for (let i = allColors.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
  }

  // Distributes shuffled pieces into tubes, ensuring no tube is fully sorted
  while (true) {
    let tempTubes = [];
    let tempColors = [...allColors];
    for (let i = 0; i < numColors; i++) {
      tempTubes.push(tempColors.splice(0, piecesPerTube));
    }

    // Ensures no tube is fully sorted
    let allValid = tempTubes.every((tube) => new Set(tube).size > 1);
    if (allValid) {
      tubes = tempTubes;
      break;
    }
    // Otherwise, reshuffle and try again
    for (let i = allColors.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
    }
  }

  // Adds empty tubes
  for (let i = 0; i < emptyTubes; i++) {
    tubes.push([]);
  }

  return { tubes };
}
