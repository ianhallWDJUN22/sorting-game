// Function to determine the number of colors based on the current level
const getNumColorsForLevel = (level) => {
    if (level <= 5) return 6;
    if (level <= 14) return 7;
    if (level <= 24) return 8;
    if (level <= 39) return 9;
    return 10;
};

// Function to generate a puzzle
export function generatePuzzle(level, randomDifficulty = false, piecesPerTube = 4, emptyTubes = 2) {
    // Select number of colors
    const numColors = randomDifficulty 
        ? [6, 7, 8, 9, 10][Math.floor(Math.random() * 5)] // Random selection from [6-10]
        : getNumColorsForLevel(level); // Default behavior

    let tubes = [];
    let allColors = [];
    let totalTubes = numColors + emptyTubes;
    
    for (let i = 0; i < numColors; i++) {
        let color = `Color${i + 1}`;
        allColors.push(...new Array(piecesPerTube).fill(color)); // Collect all pieces
    }
    
    // Shuffle all game pieces randomly
    for (let i = allColors.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
    }
    
    // Distribute shuffled pieces into tubes, ensuring no tube is fully sorted
    while (true) {
        let tempTubes = [];
        let tempColors = [...allColors];
        for (let i = 0; i < numColors; i++) {
            tempTubes.push(tempColors.splice(0, piecesPerTube));
        }
        
        // Ensure no tube is fully sorted
        let allValid = tempTubes.every(tube => new Set(tube).size > 1);
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
    
    // Add empty tubes
    for (let i = 0; i < emptyTubes; i++) {
        tubes.push([]);
    }
    
    return { tubes };
}
