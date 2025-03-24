import React, { useState, useEffect, useRef } from "react";
import { generatePuzzle } from "../utils/gameLogic";
import "../styles/GameBoard.css";
import SoundManager from "./SoundManager";
import themes from "../utils/themeConfig";

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
  const [randomDifficulty, setRandomDifficulty] = useState(false);
  const [pendingNewGame, setPendingNewGame] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // theme states
  const [selectedTheme, setSelectedTheme] = useState("default");
  //animation states
  const [animateReset, setAnimateReset] = useState(false);
  //audio states
  const [playNextLevel, setPlayNextLevel] = useState(false);
  const [playLevelClear, setPlayLevelClear] = useState(false);
  const [playReset, setPlayReset] = useState(false);
  const [muted, setMuted] = useState(false);
  const [muteMusic, setMuteMusic] = useState(true);

  // Function to apply theme
  const applyTheme = (themeName) => {
    if (selectedTheme !== themeName) {
      setClosingSettings(true); // Triggers flicker-out animation
      setTimeout(() => {
        setClosingSettings(false); // Triggers flicker-in animation
        const theme = themes[themeName] || themes.default;
        Object.entries(theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });
        setSelectedTheme(themeName); // Update state
        localStorage.setItem("selectedTheme", themeName); // Save preference
      }, 100); // Used to match flicker animation timing
    }
  };

  // Load saved theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme && themes[savedTheme]) {
      applyTheme(savedTheme);
    }
  }, []);

  // Save game state in local storage
  useEffect(() => {
    if (tubes.length > 0) {
      // Prevents saving empty state on load
      const gameState = {
        tubes,
        initialTubes,
        moveHistory,
        level,
        isSolved,
        randomDifficulty,
      };
      localStorage.setItem("gameState", JSON.stringify(gameState));
    }
  }, [tubes, moveHistory, level, isSolved]);

  // Retrieve the saved game
  useEffect(() => {
    const savedGame = localStorage.getItem("gameState");

    if (savedGame) {
      const {
        tubes,
        initialTubes,
        moveHistory,
        level,
        isSolved,
        randomDifficulty,
      } = JSON.parse(savedGame);
      setTubes(tubes);
      setInitialTubes(initialTubes);
      setMoveHistory(moveHistory);
      setLevel(level);
      setIsSolved(isSolved);
      setRandomDifficulty(randomDifficulty);
    } else {
      startNewPuzzle(); // Starts a new puzzle only if no saved data exists
    }
  }, []);

  // Removes the saved gameState from local storage and resets relevent game states
  // This is attached to the New Game button in the settings menu
  const clearGameState = () => {
    localStorage.removeItem("gameState");

    // Close the settings modal
    setShowSettings(false);
    setShowConfirmation(false);

    // Reset relevant game states
    setTubes([]);
    setInitialTubes([]);
    setMoveHistory([]);
    setSelectedTube(null);
    setHighlightedPieces([]);
    setRecentlyMoved([]);
    setIsSolved(false);

    // Ensure level and randomDifficulty reset before generating a new puzzle
    setRandomDifficulty(false);
    setLevel(1);

    // Set flag to indicate a new game is pending
    setPendingNewGame(true);
  };

  // Ensure a new game starts AFTER the state update is fully applied
  useEffect(() => {
    if (pendingNewGame) {
      startNewPuzzle(1);
      setPendingNewGame(false);
    }
  }, [level, randomDifficulty, pendingNewGame]);

  // Initialize the first puzzle on component mount only if no saved game data exists
  useEffect(() => {
    const savedGame = localStorage.getItem("gameState");
    if (!savedGame) {
      startNewPuzzle();
    }
  }, [level]);

  const toggleRandomDifficulty = () => {
    setRandomDifficulty((prev) => !prev);
  };

  // Mutes sound effects
  const toggleMute = () => {
    setMuted((prev) => !prev);
  };
  // Mute background music
  const toggleMuteMusic = () => {
    setMuteMusic((prev) => !prev);
  };

  const bgMusicRef = useRef(null);

  // Play Background music on a loop
  useEffect(() => {
    bgMusicRef.current = new Audio("/sorting-game/audio/bgMusic.wav");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.1;

    if (!muteMusic) {
      bgMusicRef.current
        .play()
        .catch((error) => console.log("Autoplay prevented:", error));
    }

    return () => {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    };
  }, [muteMusic]);

  // Function to determine difficulty label based on level
  const getDifficultyLabel = (level, randomDifficulty) => {
    if (randomDifficulty) return "???";
    if (level <= 5) return "Easy";
    if (level <= 14) return "Intermediate";
    if (level <= 24) return "Hard";
    if (level <= 39) return "Expert";
    return "Master";
  };

  // Generates a new puzzle
  const startNewPuzzle = (overrideLevel = level) => {
    setTubes([]);
    setAnimateReset(true);

    setTimeout(() => {
      const { tubes: initialTubesState } = generatePuzzle(
        overrideLevel,
        randomDifficulty
      );
      setTubes(initialTubesState);
      setInitialTubes(initialTubesState.map((tube) => [...tube]));
      setMoveHistory([]);
      setSelectedTube(null);
      setHighlightedPieces([]);
      setRecentlyMoved([]);
      setIsSolved(false);

      setTimeout(() => {
        setAnimateReset(false);
      }, 300);
    }, 10);
  };

  // Function to toggle instructions modal
  const toggleInstructions = () => {
    if (showInstructions) {
      setClosingModal(true); // Start flicker-out animation
      setTimeout(() => {
        setShowInstructions(false); // Hide modal after animation
        setClosingModal(false);
      }, 300);
    } else {
      setShowInstructions(true); // Show modal with flicker-in animation
    }
  };

  // Toggle settings modal
  const toggleSettings = () => {
    if (showSettings) {
      setClosingSettings(true);
      setTimeout(() => {
        setShowSettings(false);
        setClosingSettings(false);
      }, 300);
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
        const newTubes = tubes.map((tube) => [...tube]);
        let movingPieces = [newTubes[selectedTube].pop()];

        // Automatically move matching pieces in a stack
        while (
          newTubes[selectedTube].length > 0 &&
          newTubes[selectedTube][newTubes[selectedTube].length - 1] ===
            movingPieces[0] &&
          newTubes[index].length + movingPieces.length < 4
        ) {
          movingPieces.push(newTubes[selectedTube].pop());
        }

        // Validates and executes the move
        if (
          newTubes[index].length < 4 &&
          (newTubes[index].length === 0 ||
            newTubes[index][newTubes[index].length - 1] === movingPieces[0])
        ) {
          newTubes[index].push(...movingPieces);

          // Updates recently moved pieces for animation
          const movePositions = movingPieces.map((_, i) => ({
            tube: index,
            position: newTubes[index].length - 1 - i,
          }));
          setRecentlyMoved(movePositions);

          setTubes(newTubes);
          setMoveHistory([
            ...moveHistory,
            { from: selectedTube, to: index, pieces: movingPieces.length },
          ]);
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

  // Checks if the puzzle has been successfully solved
  const checkWinCondition = (currentTubes) => {
    const allSorted = currentTubes.every(
      (tube) =>
        tube.length === 0 || (tube.length === 4 && new Set(tube).size === 1)
    );

    if (allSorted && !isSolved) {
      setIsSolved(true);
      setPlayLevelClear(true);

      setTimeout(() => {
        setPlayLevelClear(false);
      }, 200);
    }
  };

  // Function to progress to the next level and generate a new puzzle after a puzzle is solved
  const handleNextLevel = () => {
    setPlayNextLevel(true);

    setTimeout(() => {
      setLevel((prevLevel) => {
        const newLevel = prevLevel + 1;
        setTimeout(() => startNewPuzzle(newLevel), 10);
        return newLevel;
      });

      setPlayNextLevel(false);
    }, 10);
  };

  // Handles undoing the last move
  const handleUndo = () => {
    if (moveHistory.length === 0 || isSolved) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    const newTubes = tubes.map((tube) => [...tube]);
    const movedPieces = newTubes[lastMove.to].splice(-lastMove.pieces);
    newTubes[lastMove.from].push(...movedPieces);
    setTubes(newTubes);
    setMoveHistory(moveHistory.slice(0, -1));
  };

  // Resets the current puzzle to its initial state
  const handleReset = () => {
    setTimeout(() => {
      setAnimateReset(true);
      setPlayReset(true); // Play Reset Sound Effect

      setTimeout(() => {
        setTubes(initialTubes.map((tube) => [...tube])); // Restore from initial puzzle state
        setMoveHistory([]);
        setSelectedTube(null);
        setHighlightedPieces([]);
        setRecentlyMoved([]);
        setIsSolved(false);
        setAnimateReset(false);
        setPlayReset(false);
      }, 200);
    }, 10);
  };

  // UI
  return (
    <div>
      <SoundManager
        playNextLevel={playNextLevel}
        playLevelClear={playLevelClear}
        playReset={playReset}
        muted={muted}
      />
      {/* Settings Button - should consider importing SVG to improve readability */}
      <div className='instructions-container'>
        <button className='settings-button' onClick={toggleSettings}>
          <svg className='settings-icon' xmlns='http://www.w3.org/2000/svg'>
            <path d='M20.991,10H19.42a1.039,1.039,0,0,1-.951-.674l-.005-.013a1.04,1.04,0,0,1,.2-1.146l1.11-1.11a1.01,1.01,0,0,0,0-1.428l-1.4-1.4a1.01,1.01,0,0,0-1.428,0l-1.11,1.11a1.04,1.04,0,0,1-1.146.2l-.013,0A1.04,1.04,0,0,1,14,4.579V3.009A1.009,1.009,0,0,0,12.991,2H11.009A1.009,1.009,0,0,0,10,3.009v1.57a1.04,1.04,0,0,1-.674.952l-.013,0a1.04,1.04,0,0,1-1.146-.2l-1.11-1.11a1.01,1.01,0,0,0-1.428,0l-1.4,1.4a1.01,1.01,0,0,0,0,1.428l1.11,1.11a1.04,1.04,0,0,1,.2,1.146l0,.013A1.039,1.039,0,0,1,4.58,10H3.009A1.009,1.009,0,0,0,2,11.009v1.982A1.009,1.009,0,0,0,3.009,14H4.58a1.039,1.039,0,0,1,.951.674l0,.013a1.04,1.04,0,0,1-.2,1.146l-1.11,1.11a1.01,1.01,0,0,0,0,1.428l1.4,1.4a1.01,1.01,0,0,0,1.428,0l1.11-1.11a1.04,1.04,0,0,1,1.146-.2l.013.005A1.039,1.039,0,0,1,10,19.42v1.571A1.009,1.009,0,0,0,11.009,22h1.982A1.009,1.009,0,0,0,14,20.991V19.42a1.039,1.039,0,0,1,.674-.951l.013-.005a1.04,1.04,0,0,1,1.146.2l1.11,1.11a1.01,1.01,0,0,0,1.428,0l1.4-1.4a1.01,1.01,0,0,0,0-1.428l-1.11-1.11a1.04,1.04,0,0,1-.2-1.146l.005-.013A1.039,1.039,0,0,1,19.42,14h1.571A1.009,1.009,0,0,0,22,12.991V11.009A1.009,1.009,0,0,0,20.991,10ZM12,15a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z' />
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className={`modal-settings-overlay ${
            closingSettings ? "flicker-out-modal" : "flicker-in-modal"
          }`}
        >
          <div className='modal-settings'>
            <button className='close-button' onClick={toggleSettings}>
              X
            </button>
            <div className='modal-header'>
              <h2 className='modal-header-text'>Settings</h2>
            </div>
            <div className='modal-content'>
              {/* Gameplay Section */}
              <h3>Gameplay:</h3>
              <div className='toggle-list'>
                <label className='mute-toggle'>
                  <input
                    type='checkbox'
                    checked={randomDifficulty}
                    onChange={toggleRandomDifficulty}
                  />
                  Random Difficulty Mode
                </label>
              </div>

              {/* Visuals Section */}
              <h3>Visuals:</h3>
              <div className='toggle-list'>
                <label className='theme-toggle'>
                  <input
                    type='radio'
                    name='theme'
                    value='default'
                    checked={selectedTheme === "default"}
                    onChange={() => applyTheme("default")}
                  />
                  Green
                </label>

                <label className='theme-toggle'>
                  <input
                    type='radio'
                    name='theme'
                    value='cyan'
                    checked={selectedTheme === "cyan"}
                    onChange={() => applyTheme("cyan")}
                  />
                  Cyan
                </label>

                <label className='theme-toggle'>
                  <input
                    type='radio'
                    name='theme'
                    value='magenta'
                    checked={selectedTheme === "magenta"}
                    onChange={() => applyTheme("magenta")}
                  />
                  Magenta
                </label>
              </div>

              {/* Audio Section */}
              <h3>Audio:</h3>
              <div className='toggle-list'>
                <label className='mute-toggle'>
                  <input
                    type='checkbox'
                    checked={muted}
                    onChange={toggleMute}
                  />
                  Mute All Sounds
                </label>
                <label className='mute-toggle'>
                  <input
                    type='checkbox'
                    checked={muteMusic}
                    onChange={toggleMuteMusic}
                  />
                  Mute Background Music
                </label>
              </div>

              {/* New Game Button */}
              <button
                className='new-game-button'
                onClick={() => setShowConfirmation(true)}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Game Confirmation Modal */}
      {showConfirmation && (
        <div className='confirmation-overlay'>
          <div className='confirmation-modal'>
            <p>
              Starting a new game will overwrite all progress. Are you sure?
            </p>
            <div className='confirmation-buttons'>
              <button className='confirm-button' onClick={clearGameState}>
                Continue
              </button>
              <button
                className='cancel-button'
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='instructions-container'>
        <button className='info-button' onClick={toggleInstructions}>
          ?
        </button>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className={`modal-overlay ${
            closingModal ? "flicker-out-modal" : "flicker-in-modal"
          }`}
        >
          <div className='modal'>
            <button className='close-button' onClick={toggleInstructions}>
              X
            </button>
            <div className='modal-header'>
              <h2 className='modal-header-text'>How To Play</h2>
            </div>
            <div className='modal-content'>
              <div>
                <h3>Objective:</h3>
                <p className='objective-text'>
                  Sort all the color tiles so that each tube contains only one
                  color.
                </p>
              </div>
              <div>
                <h3>Rules:</h3>
                <ul>
                  <li>Click a tube to select the topmost tile</li>
                  <li>Click another tube to move that tile there</li>
                  <li>
                    You may only move a tile onto a tile of the same color or to
                    an empty tube
                  </li>
                  <li>Undo your last move with the "Undo" button</li>
                  <li>Reset the current puzzle with the "Reset" button</li>
                  <li>Complete the puzzle to advance to the next level</li>
                  <li>
                    The difficulty will increase as you play from "Easy" to
                    "Master"
                  </li>
                  <li>
                    Or switch to Random Difficulty Mode in the settings for a
                    more varied experience
                  </li>
                  <li>-</li>
                  <li>Happy sorting!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game board and associated labels and buttons */}
      <div className='level-header'>
        <h2>
          Level {level} -{" "}
          <span className='difficulty-label'>
            {getDifficultyLabel(level, randomDifficulty)}
          </span>
        </h2>
      </div>
      <div className='game-board'>
        {tubes.map((tube, index) => (
          <div
            key={index}
            className={`tube ${animateReset ? "flicker-in-tubes" : ""} ${
              selectedTube === index ? "selected" : ""
            }`}
            onClick={() => handleTubeClick(index)}
          >
            {tube.map((piece, i) => (
              <div
                key={i}
                className={`piece ${piece} 
              ${
                selectedTube === index && highlightedPieces.includes(i)
                  ? "highlighted "
                  : ""
              } 
              ${
                recentlyMoved.some((p) => p.tube === index && p.position === i)
                  ? "flicker"
                  : ""
              }`}
              ></div>
            ))}
          </div>
        ))}
      </div>

      <div className='bottom-buttons'>
        {!isSolved && (
          <div className='controls'>
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || isSolved}
            >
              Undo
            </button>
            <button onClick={handleReset}>Reset</button>
          </div>
        )}
        {isSolved && (
          <div className='win-message flicker'>
            <p>Puzzle Solved!</p>
            <button onClick={handleNextLevel}>Next Level</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
