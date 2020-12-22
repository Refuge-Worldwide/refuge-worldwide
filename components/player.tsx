import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import Pause from "../icons/pause";
import Play from "../icons/play";
import { RadioCoInterface } from "../types/shared";

const getRadioCoStatus = async (_: any, stationId: string) => {
  const URL = `https://public.radio.co/stations/${stationId}/status`;

  const res = await fetch(URL);

  return res.json();
};

function useRadioCoStatus(stationId: string) {
  return useSWR<RadioCoInterface>(["RadioCo", stationId], getRadioCoStatus, {
    /**
     * @note Refresh the radio data every 30s
     */
    // refreshInterval: 30 * 1000,
  });
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
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white opacity-25" />
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
  const REFUGE_WW = "s3699c5e49";

  const AUDIO_SRC = `https://streaming.radio.co/${REFUGE_WW}/listen`;

  const { data } = useRadioCoStatus(REFUGE_WW);
  const isOnline = data?.status === "online";

  const player = useRef<HTMLAudioElement>(null);

  const { isPlaying, play, pause } = usePlayerState(player);

  return (
    <section className="bg-black text-white">
      <div className="px-4 md:px-8 pt-3 pb-3">
        <div className="grid grid-cols-10 gap-9 items-center">
          <div className="col-span-1">
            <BroadcastingIndicator status={data?.status} />
          </div>
          <div className="col-span-8">
            {isOnline ? (
              <div className="overflow-x-scroll">
                <p className="whitespace-nowrap">{data?.current_track.title}</p>
              </div>
            ) : null}
          </div>
          <div className="col-span-1">
            {isOnline && (
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
            )}
          </div>
        </div>
      </div>

      {isOnline && (
        <audio ref={player} src={AUDIO_SRC} hidden>
          <source src={AUDIO_SRC} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </section>
  );
}
