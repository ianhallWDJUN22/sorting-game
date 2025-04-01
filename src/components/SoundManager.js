import React, { useEffect, useRef } from "react";

const SoundManager = ({ playNextLevel, playReset, playLevelClear, muted }) => {
  const nextLevelAudioRef = useRef(null);
  const resetAudioRef = useRef(null);
  const levelClearAudioRef = useRef(null);

  useEffect(() => {
    nextLevelAudioRef.current = new Audio("/sorting-game/audio/newBoard.wav");
    nextLevelAudioRef.current.volume = muted ? 0 : 0.05;

    resetAudioRef.current = new Audio("/sorting-game/audio/reset2.mp3");
    resetAudioRef.current.volume = muted ? 0 : 0.25;

    levelClearAudioRef.current = new Audio("/sorting-game/audio/levelClear.wav");
    levelClearAudioRef.current.volume = muted ? 0 : 0.4;
  }, [muted]);

  useEffect(() => {
    if (playNextLevel && !muted) {
      nextLevelAudioRef.current.currentTime = 0;
      nextLevelAudioRef.current.play();
    }
  }, [playNextLevel, muted]);

  useEffect(() => {
    if (playReset && !muted) {
      resetAudioRef.current.currentTime = 0;
      resetAudioRef.current.play();
    }
  }, [playReset, muted]);

  useEffect(() => {
    if (playLevelClear && !muted) {
      levelClearAudioRef.current.currentTime = 0;
      levelClearAudioRef.current.play();
    }
  }, [playLevelClear, muted]);

  return null;
};

export default SoundManager;
