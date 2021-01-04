import { MutableRefObject, useCallback, useEffect, useState } from "react";

export default function usePlayerState(
  ref: MutableRefObject<HTMLAudioElement>
) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const setStatePlaying = () => setIsPlaying(true);
    const setStatePaused = () => setIsPlaying(false);

    ref?.current?.addEventListener("play", setStatePlaying);
    ref?.current?.addEventListener("pause", setStatePaused);

    return () => {
      ref?.current?.removeEventListener("play", setStatePlaying);
      ref?.current?.removeEventListener("pause", setStatePaused);
    };
  }, [ref]);

  const play = useCallback(async () => {
    try {
      await ref?.current?.play();
    } catch (error) {
      console.error(error);
    }
  }, [ref]);

  const pause = useCallback(() => {
    try {
      ref?.current?.pause();
    } catch (error) {
      console.error(error);
    }
  }, [ref]);

  return {
    isPlaying,
    play,
    pause,
  };
}
