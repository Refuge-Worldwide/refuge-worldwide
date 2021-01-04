import cn from "classnames";
import { useRef } from "react";
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

export default function LivePlayer() {
  const REFUGE_WW = "s3699c5e49";

  const AUDIO_SRC = `https://streaming.radio.co/${REFUGE_WW}/listen`;

  const { data } = useRadioCoStatus(REFUGE_WW);
  const isOnline = data?.status === "online";

  const player = useRef<HTMLAudioElement>(null);

  const { isPlaying, play, pause } = usePlayerState(player);

  const playerWrapperClassNames = cn("bg-black text-white", {
    "sticky top-0 z-50": isPlaying,
  });

  return (
    <section className={playerWrapperClassNames}>
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

      <audio ref={player} src={AUDIO_SRC} hidden>
        {isPlaying && <source src={AUDIO_SRC} type="audio/mpeg" />}
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}
