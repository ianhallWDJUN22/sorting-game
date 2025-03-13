import React, { useState, useEffect, useRef } from "react";
import { generatePuzzle } from "../utils/gameLogic";
import "../styles/GameBoard.css";
import SoundManager from "./SoundManager";

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
  const [showInstructions, setShowInstructions] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [closingSettings, setClosingSettings] = useState(false);
  //animation states
  const [animateReset, setAnimateReset] = useState(false);
  //audio states
  const [playNextLevel, setPlayNextLevel] = useState(false);
  const [playLevelClear, setPlayLevelClear] = useState(false);
  const [playReset, setPlayReset] = useState(false);
  const [muted, setMuted] = useState(false); // New state for mute functionality
  const [muteMusic, setMuteMusic] = useState(true); // Controls background music, default to muted
  const bgMusicRef = useRef(null); // Reference for bgMusic

  
  
  // Effect to initialize the first puzzle on component mount
  useEffect(() => {
    startNewPuzzle();
  }, [level]);


// Function to toggle mute
const toggleMute = () => {
    setMuted(prev => !prev);
  };


const toggleMuteMusic = () => {
    setMuteMusic(prev => !prev);
};

useEffect(() => {
    bgMusicRef.current = new Audio("/sorting-game/audio/bgMusic.wav"); 
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.05; // Adjust volume as needed

    if (!muteMusic) {
        bgMusicRef.current.play().catch(error => console.log("Autoplay prevented:", error));
    }

    return () => {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
    };
}, [muteMusic]);

    // Function to determine difficulty label based on level
    const getDifficultyLabel = (level) => {
        if (level <= 5) return "Easy";
        if (level <= 10) return "Intermediate";
        if (level <= 15) return "Hard";
        if (level <= 20) return "Expert";
        return "Master";
      };

  // Function to generate a new puzzle and reset game state
  const startNewPuzzle = () => {
    setTubes([]); // Temporarily clear tubes
    setAnimateReset(true); // Trigger flicker-in animation when new tubes load
  
    setTimeout(() => {
      const { tubes: initialTubesState } = generatePuzzle(level);
      setTubes(initialTubesState);
      setInitialTubes(initialTubesState.map(tube => [...tube]));
      setMoveHistory([]);
      setSelectedTube(null);
      setHighlightedPieces([]);
      setRecentlyMoved([]);
      setIsSolved(false);
      
      setTimeout(() => {
        setAnimateReset(false); // Reset animation state after it plays
      }, 300); // Slight delay to ensure animation applies
    }, 10);
  };

  // Function to progress to the next level and generate a new puzzle
  const handleNextLevel = () => {
    setPlayNextLevel(true); // Trigger next level sound
    setTimeout(() => {
      setLevel(prevLevel => prevLevel + 1);
      setPlayNextLevel(false); // Reset state after sound plays
    }, 10);
  };
  

    // Function to toggle instructions modal
    const toggleInstructions = () => {
        if (showInstructions) {
          setClosingModal(true); // Start flicker-out animation
          setTimeout(() => {
            setShowInstructions(false); // Hide modal after animation
            setClosingModal(false);
          }, 300); // Matches flicker-out animation duration
        } else {
          setShowInstructions(true); // Show modal with flicker-in animation
        }
      };

        // Function to toggle settings modal
  const toggleSettings = () => {
    if (showSettings) {
      setClosingSettings(true); // Start flicker-out animation
      setTimeout(() => {
        setShowSettings(false); // Hide modal after animation
        setClosingSettings(false);
      }, 300); // Matches flicker-out animation duration
    } else {
      setShowSettings(true); // Show modal with flicker-in animation
    }
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
    setTimeout(() => {
      setAnimateReset(true);
      setPlayReset(true); // Trigger flicker-in animation for board reset
      setTimeout(() => {
        setTubes(initialTubes.map(tube => [...tube]));
        setMoveHistory([]);
        setSelectedTube(null);
        setHighlightedPieces([]);
        setRecentlyMoved([]);
        setIsSolved(false);
        setAnimateReset(false); // Reset animation after playing
        setPlayReset(false); 
      }, 200);
    }, 10);
  };
  
  

  // Checks if the puzzle has been successfully solved
  const checkWinCondition = (currentTubes) => {
    const allSorted = currentTubes.every(
      tube => tube.length === 0 || (tube.length === 4 && new Set(tube).size === 1)
    );
  
    if (allSorted && !isSolved) { // Ensures it only triggers once
      setIsSolved(true);
      setPlayLevelClear(true); // Play sound effect
  
      setTimeout(() => {
        setPlayLevelClear(false); // Reset state to allow future plays
      }, 200); // Adjust timing based on sound duration
    }
  };
  

  return (
    <div>
      <SoundManager playNextLevel={playNextLevel} playLevelClear={playLevelClear} playReset={playReset} muted={muted}/>
      {/* Settings Button */}
      <div className="instructions-container">
      <button className="settings-button" onClick={toggleSettings}>⚙️</button>
      </div>
      {/* Settings Modal */}
      {showSettings && (
        <div className={`modal-settings-overlay ${closingSettings ? "flicker-out-modal" : "flicker-in-modal"}`}>
          <div className="modal-settings">
            <button className="close-button" onClick={toggleSettings}>X</button>
            <div className="modal-header">
              <h2 className="modal-header-text">Settings</h2>
            </div>
            <div className="modal-content">
            <h3>Audio:</h3>
            <label className="mute-toggle">
                <input type="checkbox" checked={muted} onChange={toggleMute} />
                Mute All Sounds
              </label>
              <label className="mute-toggle">
    <input type="checkbox" checked={muteMusic} onChange={toggleMuteMusic} />
    Mute Background Music
  </label>
            </div>
          </div>
        </div>
      )}
      <div className="instructions-container">
        <button className="info-button" onClick={toggleInstructions}>?</button>
      </div>
      {/* Instructions Modal */}
      {showInstructions && (
        <div className={`modal-overlay ${closingModal ? "flicker-out-modal" : "flicker-in-modal"}`}>
          <div className="modal">
              <button className="close-button" onClick={toggleInstructions}>X</button>
            <div className="modal-header">
              <h2 className="modal-header-text">How To Play</h2>
            </div>
            <div className="modal-content">
              <div>
                <h3>Objective:</h3>
                <p className="objective-text">Sort all the color tiles so that each tube contains only one color.</p>
              </div>
              <div>
              <h3>Rules:</h3>
              <ul>
                <li>Click a tube to select the topmost tile</li>
                <li>Click another tube to move that tile there</li>
                <li>You may only move a tile onto a tile of the same color or to an empty tube</li>
                <li>Undo your last move with the "Undo" button</li>
                <li>Reset the current puzzle with the "Reset" button</li>
                <li>Complete the puzzle to advance to the next level</li>
                <li>The difficulty will increase as you play from "Easy" to "Master"</li>
                <li>-</li>
                <li>Happy sorting!</li>
              </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="level-header">
      <h2>Level {level} - <span className="difficulty-label">{getDifficultyLabel(level)}</span></h2>
      </div>
      <div className="game-board">
  {tubes.map((tube, index) => (
    <div 
      key={index} 
      className={`tube ${animateReset ? "flicker-in-tubes" : ""} ${selectedTube === index ? "selected" : ""}`}
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

      <div className="bottom-buttons">
       {!isSolved && ( <div className="controls">
          <button onClick={handleUndo} disabled={moveHistory.length === 0 || isSolved}>Undo</button>
          <button onClick={handleReset}>Reset</button>
      </div>
       )}
      {isSolved && (
        <div className="win-message flicker">
          <p>Puzzle Solved!</p>
          <button onClick={handleNextLevel}>Next Level</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default GameBoard;

