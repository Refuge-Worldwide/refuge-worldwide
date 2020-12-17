import {
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import Pause from "../icons/pause";
import Play from "../icons/play";
import { RadioCoInterface } from "../types/shared";
import { isServer } from "../util";

const getRadioCo = async (_: any, stationId: string) => {
  const URL = `https://public.radio.co/stations/${stationId}/status`;

  const res = await fetch(URL);

  return res.json();
};

function useRadioCo(stationId: string) {
  return useSWR<RadioCoInterface>(["RadioCo", stationId], getRadioCo, {});
}

const BroadcastingIndicator = ({
  status,
}: {
  status: "online" | "offline";
}) => {
  if (status === "online")
    return (
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red animate-pulse" />
        <p>Live</p>
      </div>
    );

  return (
    <div className="flex items-center space-x-6">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red opacity-10 animate-pulse" />
      <p>Offline</p>
    </div>
  );
};

function usePlayerState(ref: MutableRefObject<HTMLAudioElement>) {
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

export default function Player() {
  const FOUNDATION_FM = "s0628bdd53";
  const AUDIO_SRC = `https://streamer.radio.co/${FOUNDATION_FM}/listen`;

  const { data } = useRadioCo(FOUNDATION_FM);

  const player = useRef<HTMLAudioElement>(null);

  const { isPlaying, play, pause } = usePlayerState(player);

  return (
    <section className="bg-black text-white">
      <div className="mx-10 pt-3 pb-3 grid grid-cols-10 gap-9 items-center">
        <div className="col-span-1">
          <BroadcastingIndicator status={data?.status} />
        </div>
        <div className="col-span-8">
          <p>{data?.current_track.title}</p>
        </div>
        <div className="col-span-1">
          <div className="flex justify-end">
            {isPlaying ? (
              <button
                className="focus:outline-none focus:ring-4"
                onClick={pause}
              >
                <Pause />
              </button>
            ) : (
              <button
                className="focus:outline-none focus:ring-4"
                onClick={play}
              >
                <Play />
              </button>
            )}
          </div>
        </div>
      </div>

      <audio ref={player} src={AUDIO_SRC} hidden>
        <source src={AUDIO_SRC} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}
