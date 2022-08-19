import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { ActivePlayer, useGlobalStore } from "./useStore";

export default function usePlayerState({
  audioRef,
  sourceRef,
  url,
}: {
  audioRef: MutableRefObject<HTMLAudioElement>;
  sourceRef: MutableRefObject<HTMLSourceElement>;
  url: string;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  useEffect(() => {
    const setStatePlaying = () => setIsPlaying(true);
    const setStatePaused = () => setIsPlaying(false);

    audioRef?.current?.addEventListener("play", setStatePlaying);
    audioRef?.current?.addEventListener("pause", setStatePaused);

    return () => {
      audioRef?.current?.removeEventListener("play", setStatePlaying);
      audioRef?.current?.removeEventListener("pause", setStatePaused);
    };
  }, [audioRef]);

  const play = useCallback(async () => {
    try {
      setIsPlaying(true);

      activePlayerSet(ActivePlayer.RADIO_CO);

      if (!sourceRef?.current?.getAttribute("src")) {
        sourceRef?.current?.setAttribute("src", url);
        audioRef?.current?.load();
      }

      await audioRef?.current?.play();
    } catch (error) {
      setIsPlaying(false);

      console.error(error);
    }
  }, [audioRef]);

  const pause = useCallback(async () => {
    try {
      setIsPlaying(false);

      sourceRef?.current?.setAttribute("src", "");
      audioRef?.current?.pause();
    } catch (error) {
      setIsPlaying(false);

      console.error(error);
    }
  }, [audioRef]);

  useEffect(() => {
    if (activePlayer === ActivePlayer.MIXCLOUD) {
      pause();
    }
  }, [activePlayer]);

  return {
    isPlaying,
    play,
    pause,
  };
}
