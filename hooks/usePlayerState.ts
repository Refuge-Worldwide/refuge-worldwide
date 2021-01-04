import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { showKey } from "../lib/mixcloud";

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

  const [, setKey] = showKey.use();

  /**
   * @note This will unmount the Mixcloud player so we don't have two media sources playing at once.
   */
  const removeMixcloudPlayer = () => setKey(null);

  const play = useCallback(async () => {
    try {
      removeMixcloudPlayer();

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
