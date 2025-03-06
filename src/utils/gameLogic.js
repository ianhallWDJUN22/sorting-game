// src/utils/gameLogic.js

// Function to determine the number of colors based on the current level
const getNumColorsForLevel = (level) => {
    if (level <= 5) return 6;
    if (level <= 10) return 7;
    if (level <= 15) return 8;
    if (level <= 20) return 9;
    return 10;
};

// Function to generate a solvable game piece sorting puzzle
export function generateSolvablePuzzle(level, piecesPerTube = 4, emptyTubes = 2) {
    const numColors = getNumColorsForLevel(level); // Determine number of colors based on level
    let tubes = [];
    let allColors = [];
    let totalTubes = numColors + emptyTubes;
    
    for (let i = 0; i < numColors; i++) {
        let color = `Color${i + 1}`;
        allColors.push(...new Array(piecesPerTube).fill(color)); // Collect all pieces
    }
    
    // Step 2: Shuffle all game pieces randomly
    for (let i = allColors.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [allColors[i], allColors[j]] = [allColors[j], allColors[i]];
    }
    
    // Step 3: Distribute shuffled pieces into tubes, ensuring no tube is fully sorted
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
    
    // Step 4: Add empty tubes
    for (let i = 0; i < emptyTubes; i++) {
        tubes.push([]);
    }
    
    return { tubes };
}