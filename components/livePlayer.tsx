import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import usePlayerState from "../hooks/usePlayerState";
import useSchedule from "../hooks/useSchedule";
import Pause from "../icons/pause";
import Play from "../icons/play";
import Marquee from "./marquee";
import Link from "next/link";
import { Cross } from "../icons/cross";
import Image from "next/image";
import { AiOutlineCalendar } from "react-icons/ai";

const BroadcastingIndicator = ({
  status,
  isLoading,
  error,
  liveNow,
  channel,
}: {
  status: "online" | "offline";
  isLoading: boolean;
  error: Error;
  liveNow: any;
  channel?: string;
}) => {
  if (status === "online")
    return (
      <div className="grow-0 items-center space-x-2 hidden md:flex border-white border px-4 pt-1.5 pb-2 rounded-full">
        <p className="leading-none mt-1 text-xxs font-medium uppercase">LIVE</p>
        <div className="shrink-0 w-7 h-7 sm:h-3 sm:w-3 rounded-full bg-red animate-pulse mt-1" />
      </div>
    );
  else if (isLoading)
    return (
      <div className="grow-0 flex items-center space-x-6 opacity-70">
        <div className="shrink-0 w-7 h-7 sm:h-10 sm:w-10 rounded-full bg-white/25" />
        <div className="h-6 sm:h-9 w-56 flex items-center space-x-2 whitespace-nowrap px-2 ml-6 bg-white opacity-25"></div>
        <p className="hidden leading-none mt-1 text-tiny animate-pulse uppercase">
          Loading
        </p>
      </div>
    );

  return (
    <div className="grow-0 flex items-center space-x-6">
      <div className="shrink-0 w-7 h-7 sm:h-10 sm:w-10 rounded-full bg-white/25" />
      <p className="leading-none mt-1 text-tiny uppercase">Offline</p>
    </div>
  );
};

export default function LivePlayer() {
  const CH1 = "https://streaming.radio.co/s3699c5e49/listen";
  const CH2 = "https://s4.radio.co/s69b281ac0/listen";

  const { scheduleData, isLoading, error } = useSchedule();

  const isOnline = scheduleData?.status === "online";
  const ch2IsOnline = scheduleData?.ch2Status === "online";

  const player = useRef<HTMLAudioElement>(null);
  const source = useRef<HTMLSourceElement>(null);

  const { isPlaying, play, play2, pause } = usePlayerState({
    audioRef: player,
    sourceRef: source,
    url: CH1,
    urlCh2: CH2,
  });

  // const { isPlaying2, play, pause } = usePlayerState({
  //   audioRef: player2,
  //   sourceRef: source2,
  //   url: CH2,
  // });

  const playerWrapperClassNames = cn(
    "bg-black text-white h-12 sm:h-16 pl-4 sm:pl-8 flex items-center space-x-3 sm:space-x-5",
    {
      "sticky top-0 z-50": isOnline,
    }
  );

  useEffect(() => {
    if ("mediaSession" in navigator && scheduleData?.liveNow) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: scheduleData.liveNow.title,
        artist: "Refuge Worldwide",
        artwork: [
          {
            src: scheduleData.liveNow.artwork + "?w=384&h=384&fit=fill&f=faces",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: scheduleData.liveNow.artwork + "?w=512&h=512&fit=fill&f=faces",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, [scheduleData]);

  return (
    <section className={playerWrapperClassNames}>
      {/* <BroadcastingIndicator
        status={scheduleData?.status}
        isLoading={isLoading}
        error={error}
        liveNow={scheduleData?.liveNow}
      />

      <div className="w-0.5 bg-white h-full"></div> */}

      {isOnline && (
        <>
          <button
            className="grow-0 h-7 w-7 sm:h-8 sm:w-8 focus:outline-none focus:ring-4"
            onClick={isPlaying == 1 ? pause : play}
            aria-label={
              isPlaying == 1 ? "Pause Live Broadcast" : "Play Live Broadcast"
            }
          >
            {isPlaying == 1 ? <Pause /> : <Play />}
          </button>
        </>
      )}

      {!isLoading && !error && scheduleData?.liveNow?.title && (
        <Link
          className="flex-1 truncate mt-0.5 pr-14"
          href={scheduleData?.liveNow?.link ? scheduleData.liveNow.link : ""}
        >
          <Marquee
            key={scheduleData?.liveNow.title + ch2IsOnline}
            className="-mr-14"
            text={
              <span className="pr-8">
                {ch2IsOnline && <>Live on 1:</>} {scheduleData?.liveNow.title}
              </span>
            }
          />
        </Link>
      )}

      {ch2IsOnline && (
        <>
          <div className="w-0.5 bg-white h-full !ml-0"></div>
          <button
            className="grow-0 h-7 w-7 sm:h-8 sm:w-8 focus:outline-none focus:ring-4"
            onClick={isPlaying == 2 ? pause : play2}
            aria-label={
              isPlaying == 2 ? "Pause Live Broadcast" : "Play Live Broadcast"
            }
          >
            {isPlaying == 2 ? <Pause /> : <Play />}
          </button>

          {!isLoading && !error && scheduleData?.liveNow?.title && (
            <Link className="flex-1 truncate mt-0.5" href={"/news/ploetzensee"}>
              <Marquee
                key={scheduleData?.liveNow.title + ch2IsOnline}
                text={
                  <span className="pr-8">
                    Live on 2: {scheduleData?.liveNow.title}
                  </span>
                }
                speed={0.15}
              />
            </Link>
          )}
        </>
      )}

      {!isLoading && (
        <Link
          className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 !ml-0 self-stretch items-center flex bg-black border-white border-l-2 border-r-0 text-white"
          href="/schedule"
        >
          <AiOutlineCalendar />
          <span className="sr-only lg:hidden">Schedule</span>
        </Link>
      )}

      <audio hidden id="refuge-live-player" preload="none" ref={player}>
        <source ref={source} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </section>
  );
}

export function LivePlayerLoading() {
  return (
    <section className="bg-black text-white h-12 sm:h-16 px-4 sm:px-8 flex items-center">
      <div className="grow-0 flex items-center space-x-6">
        <div className="shrink-0 w-7 h-7 sm:h-10 sm:w-10 rounded-full bg-white/25" />
        <div className="h-6 sm:h-9 w-56 flex items-center space-x-2 whitespace-nowrap px-2 ml-6 bg-white/25"></div>
        <p className="hidden leading-none mt-1">Loading</p>
      </div>
    </section>
  );
}
