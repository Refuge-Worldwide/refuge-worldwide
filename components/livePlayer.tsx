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
import { useRouter } from "next/router";
import { Arrow } from "../icons/arrow";

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

  const router = useRouter();
  const [isSchedulePage, setIsSchedulePage] = useState<boolean>(false);
  const [hasBack, setHasBack] = useState(false);

  useEffect(() => {
    setIsSchedulePage(router.pathname == "/schedule");
  }, [router]);

  useEffect(() => {
    if (window?.history?.length > 1) {
      setHasBack(true);
    }
  }, []);

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
    "bg-black text-white lg:flex items-center max-w-screen",
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
      <div className="h-12 sm:h-16 flex items-center flex-1 truncate border-b-2 border-white lg:border-0 lg:min-w-[50%]">
        {isOnline && (
          <>
            <button
              className="ml-4 sm:ml-8 mr-3 sm:mr-5 grow-0 focus:outline-none focus:ring-4 flex items-center gap-4"
              onClick={isPlaying == 1 ? pause : play}
              aria-label={
                isPlaying == 1 ? "Pause Live Broadcast" : "Play Live Broadcast"
              }
            >
              <span className="font-medium mt-1 border-white">1</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8">
                {isPlaying == 1 ? <Pause /> : <Play />}
              </div>
            </button>
          </>
        )}

        {!isLoading && !error && scheduleData?.liveNow?.title && (
          <Link
            className="flex-1 truncate mt-0.5"
            href={scheduleData?.liveNow?.link ? scheduleData.liveNow.link : ""}
          >
            <Marquee
              key={scheduleData?.liveNow.title + ch2IsOnline}
              className="-mr-14"
              text={<span className="pr-8">{scheduleData?.liveNow.title}</span>}
              speed={ch2IsOnline ? 0.2 : 0.25}
            />
          </Link>
        )}

        {!isLoading && (
          <>
            {hasBack && isSchedulePage ? (
              <button
                className="lg:hidden flex pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 !ml-0 self-stretch items-center bg-black border-white border-l-2 border-r-0 text-white"
                onClick={() => router.back()}
              >
                {isSchedulePage ? (
                  <Arrow
                    colour="white"
                    size={24}
                    className="h-6 w-[24px] rotate-180 "
                  />
                ) : (
                  <AiOutlineCalendar />
                )}
                <span className="sr-only lg:hidden">Back</span>
              </button>
            ) : (
              <Link
                className="lg:hidden flex pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 !ml-0 self-stretch items-center bg-black border-white border-l-2 border-r-0 text-white"
                href={isSchedulePage ? "/" : "/schedule"}
              >
                {isSchedulePage ? (
                  <Arrow
                    colour="white"
                    size={24}
                    className="h-6 w-[24px] rotate-180 "
                  />
                ) : (
                  <AiOutlineCalendar />
                )}
                <span className="sr-only lg:hidden">
                  {isSchedulePage ? "Back" : "Schedule"}
                </span>
              </Link>
            )}
          </>
        )}
      </div>

      {ch2IsOnline && (
        <div className="h-12 sm:h-16 flex items-center flex-1 truncate">
          <div className="w-0.5 bg-white h-full !ml-0 hidden lg:block"></div>
          <button
            className="grow-0 focus:outline-none focus:ring-4 ml-4 sm:ml-8 mr-3 sm:mr-5 lg:mx-5 flex gap-4 items-center"
            onClick={isPlaying == 2 ? pause : play2}
            aria-label={
              isPlaying == 2 ? "Pause Live Broadcast" : "Play Live Broadcast"
            }
          >
            <span className="font-medium mt-1">2</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8">
              {isPlaying == 2 ? <Pause /> : <Play />}
            </div>
          </button>

          {!isLoading && !error && scheduleData?.liveNow?.title && (
            <Link className="flex-1 truncate mt-0.5" href={"/news/ploetzensee"}>
              <Marquee
                key={scheduleData?.liveNow.title + ch2IsOnline}
                text={
                  <span className="pr-8">{scheduleData?.nextUp[2].title}</span>
                }
                speed={0.3}
              />
            </Link>
          )}
        </div>
      )}

      {!isLoading && (
        <>
          {hasBack && isSchedulePage ? (
            <button
              className="hidden lg:flex pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 !ml-0 self-stretch items-center bg-black border-white border-l-2 border-r-0 text-white"
              onClick={() => router.back()}
            >
              {isSchedulePage ? (
                <Arrow
                  colour="white"
                  size={24}
                  className="h-6 w-[24px] rotate-180 "
                />
              ) : (
                <AiOutlineCalendar />
              )}
              <span className="sr-only lg:hidden">Back</span>
            </button>
          ) : (
            <Link
              className="hidden lg:flex pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 !ml-0 self-stretch items-center bg-black border-white border-l-2 border-r-0 text-white"
              href={isSchedulePage ? "/" : "/schedule"}
            >
              {isSchedulePage ? (
                <Arrow
                  colour="white"
                  size={24}
                  className="h-6 w-[24px] rotate-180 "
                />
              ) : (
                <AiOutlineCalendar />
              )}
              <span className="sr-only lg:hidden">
                {isSchedulePage ? "Back" : "Schedule"}
              </span>
            </Link>
          )}
        </>
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
