import React, { useState, useEffect } from "react";
import { generateSolvablePuzzle } from "../utils/gameLogic";
import "../styles/GameBoard.css";

const GameBoard = () => {
  const [tubes, setTubes] = useState([]);
  const [initialTubes, setInitialTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [highlightedPieces, setHighlightedPieces] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [recentlyMoved, setRecentlyMoved] = useState([]);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    startNewPuzzle();
  }, []);

  const startNewPuzzle = () => {
    const { tubes: initialTubesState } = generateSolvablePuzzle();
    setTubes(initialTubesState);
    setInitialTubes(initialTubesState.map(tube => [...tube]));
    setMoveHistory([]);
    setSelectedTube(null);
    setHighlightedPieces([]);
    setRecentlyMoved([]);
    setIsSolved(false);
  };

  const handleNextLevel = () => {
    setLevel(prevLevel => prevLevel + 1);
    startNewPuzzle();
  };

  const handleTubeClick = (index) => {
    if (isSolved) return;
    
    if (selectedTube === null) {
      if (tubes[index].length > 0) {
        setSelectedTube(index);
        highlightStack(index);
      }
    } else {
      if (selectedTube !== index) {
        const newTubes = tubes.map(tube => [...tube]);
        let movingPieces = [newTubes[selectedTube].pop()];
        
        while (
          newTubes[selectedTube].length > 0 && 
          newTubes[selectedTube][newTubes[selectedTube].length - 1] === movingPieces[0] && 
          newTubes[index].length + movingPieces.length < 4
        ) {
          movingPieces.push(newTubes[selectedTube].pop());
        }

        if (
          newTubes[index].length < 4 && 
          (newTubes[index].length === 0 || newTubes[index][newTubes[index].length - 1] === movingPieces[0])
        ) if (
            newTubes[index].length < 4 && 
            (newTubes[index].length === 0 || newTubes[index][newTubes[index].length - 1] === movingPieces[0])
          ) {
            newTubes[index].push(...movingPieces);
          
            // 🔹 Ensure recentlyMoved is updated properly
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

  const handleUndo = () => {
    if (moveHistory.length === 0 || isSolved) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    const newTubes = tubes.map(tube => [...tube]);
    const movedPieces = newTubes[lastMove.to].splice(-lastMove.pieces);
    newTubes[lastMove.from].push(...movedPieces);
    setTubes(newTubes);
    setMoveHistory(moveHistory.slice(0, -1));
  };

  const handleReset = () => {
    setTubes(initialTubes.map(tube => [...tube]));
    setMoveHistory([]);
    setSelectedTube(null);
    setHighlightedPieces([]);
    setRecentlyMoved([]);
    setIsSolved(false);
  };

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
