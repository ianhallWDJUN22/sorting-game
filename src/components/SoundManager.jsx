import React, { useEffect, useRef } from "react";

const SoundManager = ({ playNextLevel, playReset, playLevelClear }) => {
  const nextLevelAudioRef = useRef(null);
  const resetAudioRef = useRef(null);
  const levelClearAudioRef = useRef(null);

  useEffect(() => {
    nextLevelAudioRef.current = new Audio("/sorting-game/audio/newBoard.wav");
    nextLevelAudioRef.current.volume = 0.05;

    resetAudioRef.current = new Audio("/sorting-game/audio/reset2.mp3"); // Use `.wav` since that’s your actual file
    resetAudioRef.current.volume = 0.25;

    levelClearAudioRef.current = new Audio("/sorting-game/audio/levelClear.wav");
    levelClearAudioRef.current.volume = 0.4;
  }, []);

  useEffect(() => {
    if (playNextLevel) {
      nextLevelAudioRef.current.currentTime = 0; // Restart sound
      nextLevelAudioRef.current.play();
    }
  }, [playNextLevel]);

  useEffect(() => {
    if (playReset) {
      resetAudioRef.current.currentTime = 0; // Ensure it starts from beginning
      resetAudioRef.current.play();
    }
  }, [playReset]);

  useEffect(() => {
    if (playLevelClear) {
      levelClearAudioRef.current.currentTime = 0; // Restart sound
      levelClearAudioRef.current.play();
    }
  }, [playLevelClear]);

  return null; // No UI elements needed
};

export default SoundManager;





