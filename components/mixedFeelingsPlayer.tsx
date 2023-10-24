import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import { Cross } from "../icons/cross";
import MessageSquare from "../icons/message-square";
import { useState, useEffect } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";
import cn from "classnames";
import Image from "next/image";
import PlayLarge from "../icons/playLarge";

export default function MixedFeelingsPlayer({
  isPlaying,
  onPlay,
}: {
  isPlaying: boolean;
  onPlay: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const { pathname } = useRouter();
  const isHomePage = pathname === "/";

  const [openVideo, setOpenVideo] = useState<boolean>(true);

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  const onClick = () => {};

  const playerClassName = cn(
    ((!inView && isHomePage && isPlaying) || (!isHomePage && isPlaying)) &&
      "lg:fixed lg:bottom-4 lg:right-4 z-50 w-full lg:w-1/3 lg:max-w-2xl min-w-md"
  );

  if (isHomePage || (!isHomePage && isPlaying)) {
    return (
      <div
        ref={ref}
        className={`flex flex-col lg:flex-row items-stretch bg-[#94B5FA] text-black border-b-2 border-black`}
      >
        <div
          className={`${
            isHomePage ? "aspect-video lg:grow" : "aspect-video grow lg:grow-0"
          } `}
        >
          <div className={playerClassName}>
            <div
              className={`${
                inView && isHomePage && "lg:hidden"
              } hidden lg:flex bg-black px-4 py-3 items-center justify-between gap-4`}
            >
              <div className="w-4 h-4 rounded-full bg-red animate-pulse"></div>
              <Link
                href="/news/mixed-feelings"
                className="flex items-center gap-4 grow"
              >
                <span>Mixed feelings</span>
                <Arrow colour="white" />
              </Link>
              <Link href="/chat" target="_blank">
                <MessageSquare />
              </Link>
            </div>
            <div className="relative">
              <iframe
                className="aspect-video w-screen md:w-full inline-block top-0 left-0 z-10"
                width="100%"
                height="auto"
                src="https://www.youtube.com/embed/gMNHvXSW4iE?si=Uurr0Qin5XqUep8T"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              ></iframe>
              <div
                className={`absolute top-0 left-0 z-20 aspect-video w-screen md:w-full transition duration-300 ${
                  isPlaying && "opacity-0 pointer-events-none"
                }`}
              >
                <button
                  onClick={onPlay}
                  className="relative top-0 left-0 flex group w-full"
                >
                  <Image
                    src="/images/mixed-feelings.jpg"
                    width="1920"
                    height="1080"
                    alt=""
                    className="aspect-video w-full"
                  />

                  <div className="inset-0 absolute bg-black/0 transition-colors duration-150 group-hover:bg-black/60 flex items-center justify-center text-white/0 group-hover:text-white/100">
                    <div className="-mr-4">
                      <PlayLarge />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${
            !isHomePage && "lg:hidden"
          } p-4 lg:p-8  max-w-2xl flex flex-col justify-between lg:w-2/5 lg:border-l-2`}
        >
          <div className="hidden lg:block">
            <p>
              Mixed Feelings is expanding the radio experience. Refuge Worldwide
              is proud to begin a new series of radio shows embracing the
              diverse talents and stories of artists from the disabled
              community. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
          <div>
            <Link
              href="/news/mixed-feelings"
              className="flex items-center gap-4 grow justify-center lg:justify-start"
            >
              <span>More info</span>
              <Arrow colour="black" />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
