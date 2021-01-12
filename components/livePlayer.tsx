import cn from "classnames";
import { useEffect, useRef } from "react";
import usePlayerState from "../hooks/usePlayerState";
import useRadioCoStatus from "../hooks/useRadioCoStatus";
import Pause from "../icons/pause";
import Play from "../icons/play";

const BroadcastingIndicator = ({
  status,
}: {
  status: "online" | "offline";
}) => {
  if (status === "online")
    return (
      <div className="flex-grow-0 flex items-center space-x-6">
        <div className="flex-shrink-0 w-7 h-7 sm:h-10 sm:w-10 rounded-full bg-red animate-pulse" />
        <p className="hidden md:block leading-none mt-1">Live</p>
      </div>
    );

  return (
    <div className="flex-grow-0 flex items-center space-x-6">
      <div className="flex-shrink-0 w-7 h-7 sm:h-10 sm:w-10 rounded-full bg-white opacity-25" />
      <p className="hidden md:block leading-none mt-1">Offline</p>
    </div>
  );
};

export default function LivePlayer() {
  const REFUGE_WORLDWIDE = "s3699c5e49";

  const AUDIO_SRC = `https://streaming.radio.co/${REFUGE_WORLDWIDE}/listen`;

  const { data } = useRadioCoStatus(REFUGE_WORLDWIDE);
  const isOnline = data?.status === "online";

  const player = useRef<HTMLAudioElement>(null);

  const { isPlaying, play, pause } = usePlayerState(player);

  const playerWrapperClassNames = cn(
    "bg-black text-white h-12 sm:h-16 px-4 sm:px-8 flex items-center space-x-3 sm:space-x-9",
    {
      "sticky top-0 z-50": isPlaying,
    }
  );

  useEffect(() => {
    if ("mediaSession" in navigator && data?.current_track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: data.current_track.title,
        artist: "Refuge Worldwide",
        artwork: [
          {
            src: data.current_track.artwork_url,
            sizes: "1024x1024",
            type: "image/png",
          },
        ],
      });
    }
  }, [data]);

  return (
    <section className={playerWrapperClassNames}>
      <BroadcastingIndicator status={data?.status} />

      {isOnline ? (
        <div className="flex-1 overflow-x-scroll hide-scrollbar mt-0.5">
          <span className="whitespace-nowrap leading-none">
            {data?.current_track.title}
          </span>
        </div>
      ) : null}

      {isOnline && (
        <button
          className="flex-grow-0 h-7 w-7 sm:h-9 sm:w-9 focus:outline-none focus:ring-4"
          onClick={isPlaying ? pause : play}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
      )}

      <audio
        hidden
        id="refuge-live-player"
        src={AUDIO_SRC}
        preload="none"
        ref={player}
      >
        <source src={AUDIO_SRC} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}

export function LivePlayerLoading() {
  return (
    <section className="bg-black text-white h-12 sm:h-16 px-4 sm:px-8 flex items-center">
      <p className="whitespace-nowrap leading-none mt-0.5">Loading Broadcast</p>
    </section>
  );
}
