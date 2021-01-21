import { MutableRefObject, useCallback, useEffect } from "react";
import { newRidgeState } from "react-ridge-state";
import { showKey } from "../lib/mixcloud";

export const livePlayerState = newRidgeState(false);

export default function usePlayerState(
  ref: MutableRefObject<HTMLAudioElement>
) {
  const [isPlaying, setIsPlaying] = livePlayerState.use();

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
  const unmountMixcloudPlayer = () => setKey(null);

  const play = useCallback(async () => {
    try {
      unmountMixcloudPlayer();

      await ref?.current?.play();

      ref?.current?.load();
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

  useEffect(() => {
    if (isPlaying === false) {
      pause();
    }
  }, [pause, isPlaying]);

  return {
    isPlaying,
    play,
    pause,
  };
}
