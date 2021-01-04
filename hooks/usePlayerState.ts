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

  const play = useCallback(() => ref?.current?.play(), [ref]);

  const pause = useCallback(() => ref?.current?.pause(), [ref]);

  return {
    isPlaying,
    play,
    pause,
  };
}
