import React, { useState, useEffect } from "react";
import { generateSolvablePuzzle } from "../utils/gameLogic";
import "../styles/GameBoard.css";

const GameBoard = () => {
  // State variables to manage game state
  const [tubes, setTubes] = useState([]);
  const [initialTubes, setInitialTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [highlightedPieces, setHighlightedPieces] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [recentlyMoved, setRecentlyMoved] = useState([]);
  const [level, setLevel] = useState(1);

  // Effect to initialize the first puzzle on component mount
  useEffect(() => {
    startNewPuzzle();
  }, [level]);

  // Function to generate a new puzzle and reset game state
  const startNewPuzzle = () => {
    const { tubes: initialTubesState } = generateSolvablePuzzle(level);
    setTubes(initialTubesState);
    setInitialTubes(initialTubesState.map(tube => [...tube]));
    setMoveHistory([]);
    setSelectedTube(null);
    setHighlightedPieces([]);
    setRecentlyMoved([]);
    setIsSolved(false);
  };

  // Function to progress to the next level and generate a new puzzle
  const handleNextLevel = () => {
    setLevel(prevLevel => prevLevel + 1);
  };

  // Handles user interaction when clicking on a tube
  const handleTubeClick = (index) => {
    if (isSolved) return; // Prevents interaction if puzzle is solved
    
    if (selectedTube === null) {
      if (tubes[index].length > 0) {
        setSelectedTube(index);
        highlightStack(index);
      }
    } else {
      if (selectedTube !== index) {
        const newTubes = tubes.map(tube => [...tube]);
        let movingPieces = [newTubes[selectedTube].pop()];
        
        // Automatically move matching pieces in a stack
        while (
          newTubes[selectedTube].length > 0 && 
          newTubes[selectedTube][newTubes[selectedTube].length - 1] === movingPieces[0] && 
          newTubes[index].length + movingPieces.length < 4
        ) {
          movingPieces.push(newTubes[selectedTube].pop());
        }

        // Validates and executes the move
        if (
          newTubes[index].length < 4 && 
          (newTubes[index].length === 0 || newTubes[index][newTubes[index].length - 1] === movingPieces[0])
        ) {
          newTubes[index].push(...movingPieces);
          
          // Update recently moved pieces for animation
          const movePositions = movingPieces.map((_, i) => ({
            tube: index,
            position: newTubes[index].length - 1 - i
          }));
          setRecentlyMoved(movePositions);
          
          setTubes(newTubes);
          setMoveHistory([...moveHistory, { from: selectedTube, to: index, pieces: movingPieces.length }]);
          checkWinCondition(newTubes);
        } else {
          setSelectedTube(null);
          setHighlightedPieces([]);
          return;
        }
      }
      setSelectedTube(null);
      setHighlightedPieces([]);
    }
  };

  // Highlights a stack of matching pieces when a tube is selected
  const highlightStack = (tubeIndex) => {
    let stackToHighlight = [];
    let tube = tubes[tubeIndex];
    if (tube.length === 0) return;

    let topPiece = tube[tube.length - 1];
    stackToHighlight.push(tube.length - 1);
    
    for (let i = tube.length - 2; i >= 0; i--) {
      if (tube[i] === topPiece) {
        stackToHighlight.push(i);
      } else {
        break;
      }
    }

    setHighlightedPieces(stackToHighlight);
  };

  // Handles undoing the last move
  const handleUndo = () => {
    if (moveHistory.length === 0 || isSolved) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    const newTubes = tubes.map(tube => [...tube]);
    const movedPieces = newTubes[lastMove.to].splice(-lastMove.pieces);
    newTubes[lastMove.from].push(...movedPieces);
    setTubes(newTubes);
    setMoveHistory(moveHistory.slice(0, -1));
  };

  // Resets the current puzzle to its initial state
  const handleReset = () => {
    setTubes(initialTubes.map(tube => [...tube]));
    setMoveHistory([]);
    setSelectedTube(null);
    setHighlightedPieces([]);
    setRecentlyMoved([]);
    setIsSolved(false);
  };

  // Checks if the puzzle has been successfully solved
  const checkWinCondition = (currentTubes) => {
    const allSorted = currentTubes.every(
      tube => tube.length === 0 || (tube.length === 4 && new Set(tube).size === 1)
    );
    setIsSolved(allSorted);
  };

  return (
    <div>
      <h2>Level {level}</h2>
      <div className="game-board">
        {tubes.map((tube, index) => (
          <div 
            key={index} 
            className={`tube ${selectedTube === index ? "selected" : ""}`} 
            onClick={() => handleTubeClick(index)}
          >
            {tube.map((piece, i) => (
              <div 
                key={i} 
                className={`piece ${piece} 
                    ${selectedTube === index && highlightedPieces.includes(i) ? "highlighted " : ""} 
                    ${recentlyMoved.some(p => p.tube === index && p.position === i) ? "flicker" : ""}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div>
        <div className="controls">
          <button onClick={handleUndo} disabled={moveHistory.length === 0 || isSolved}>Undo</button>
          <button onClick={handleReset}>Restart</button>
        </div>
      </div>
      {isSolved && (
        <div className="win-message flicker">
          <p>Puzzle Solved!</p>
          <button onClick={handleNextLevel}>Next Level</button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;

