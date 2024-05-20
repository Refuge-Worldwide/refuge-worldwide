import { MutableRefObject, useCallback, useEffect, useState } from "react";
import { ActivePlayer, useGlobalStore } from "./useStore";

export default function usePlayerState({
  audioRef,
  sourceRef,
  url,
  urlCh2,
}: {
  audioRef: MutableRefObject<HTMLAudioElement>;
  sourceRef: MutableRefObject<HTMLSourceElement>;
  url: string;
  urlCh2: string;
}) {
  const [isPlaying, setIsPlaying] = useState<number>(0);

  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  // useEffect(() => {
  //   const setStatePlaying = () => setIsPlaying(1);
  //   const setStatePaused = () => setIsPlaying(0);

  //   audioRef?.current?.addEventListener("play", setStatePlaying);
  //   audioRef?.current?.addEventListener("pause", setStatePaused);

  //   return () => {
  //     audioRef?.current?.removeEventListener("play", setStatePlaying);
  //     audioRef?.current?.removeEventListener("pause", setStatePaused);
  //   };
  // }, [audioRef]);

  const play = useCallback(async () => {
    try {
      setIsPlaying(1);

      activePlayerSet(ActivePlayer.CH1);

      if (sourceRef?.current?.getAttribute("src") != url) {
        sourceRef?.current?.setAttribute("src", url);
      }

      await audioRef?.current?.load();
      await audioRef?.current?.play();
    } catch (error) {
      setIsPlaying(0);

      console.error(error);
    }
  }, [audioRef]);

  const play2 = useCallback(async () => {
    try {
      console.log("play channel 2");
      setIsPlaying(2);

      activePlayerSet(ActivePlayer.CH2);

      if (sourceRef?.current?.getAttribute("src") != urlCh2) {
        sourceRef?.current?.setAttribute("src", urlCh2);
      }

      await audioRef?.current?.load();
      await audioRef?.current?.play();
    } catch (error) {
      setIsPlaying(0);

      console.error(error);
    }
  }, [audioRef]);

  const pause = useCallback(async () => {
    try {
      setIsPlaying(0);

      sourceRef?.current?.setAttribute("src", "");
      audioRef?.current?.pause();
    } catch (error) {
      setIsPlaying(0);

      console.error(error);
    }
  }, [audioRef]);

  useEffect(() => {
    if (
      activePlayer === ActivePlayer.MIXCLOUD ||
      activePlayer === ActivePlayer.SOUNDCLOUD
    ) {
      pause();
    }
  }, [activePlayer]);

  return {
    isPlaying,
    play,
    play2,
    pause,
  };
}
