// src/utils/gameLogic.js

// Function to generate a solvable game piece sorting puzzle
export function generateSolvablePuzzle(piecesPerTube = 4, emptyTubes = 2) {
    // Step 1: Randomly determine the number of colors (between 6 and 10)
    const numColors = Math.floor(Math.random() * 5) + 6; // Randomly choose between 6 and 10
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