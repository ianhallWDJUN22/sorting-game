import React, { useEffect, useRef } from "react";

const SoundManager = ({ playBoardLoad, playReset }) => {
  const boardLoadAudioRef = useRef(null);
  const resetAudioRef = useRef(null);

  useEffect(() => {
    boardLoadAudioRef.current = new Audio("/sorting-game/audio/buzzFlicker.wav");
    boardLoadAudioRef.current.volume = 0.005;

    resetAudioRef.current = new Audio("/sorting-game/audio/resetBoard.wav");
    resetAudioRef.current.volume = 0.0; // Adjust volume if needed
  }, []);

  useEffect(() => {
    if (playBoardLoad) {
      boardLoadAudioRef.current.currentTime = 0; // Restart sound
      boardLoadAudioRef.current.play();
    }
  }, [playBoardLoad]);

  useEffect(() => {
    if (playReset) {
      resetAudioRef.current.currentTime = 0; // Restart sound
      resetAudioRef.current.play();
    }
  }, [playReset]);

  return null; // No UI elements needed
};

export default SoundManager;



