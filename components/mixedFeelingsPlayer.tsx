import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import { Cross } from "../icons/cross";
import MessageSquare from "../icons/message-square";
import { useState } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";
import cn from "classnames";

export default function MixedFeelingsPlayer() {
  const { pathname } = useRouter();
  const isHomePage = pathname === "/";
  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const [openVideo, setOpenVideo] = useState<boolean>(true);

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  const playerClassName = cn(
    !inView &&
      isHomePage &&
      activePlayer === ActivePlayer.RADIO_CO &&
      "lg:fixed lg:bottom-4 lg:right-4 z-50 w-full lg:w-1/3 lg:max-w-2xl min-w-md",
    !isHomePage &&
      activePlayer === ActivePlayer.RADIO_CO &&
      "lg:fixed lg:bottom-4 lg:right-4 z-50 w-full lg:w-1/3 lg:max-w-2xl min-w-md"
  );

  if (isHomePage || (!isHomePage && activePlayer === ActivePlayer.RADIO_CO)) {
    return (
      <div
        ref={ref}
        className={`flex flex-col lg:flex-row items-stretch bg-black text-white`}
      >
        <div className={`${isHomePage && "aspect-video grow"} `}>
          <div className={playerClassName}>
            <div
              className={`${
                inView && isHomePage && "lg:hidden"
              } hidden lg:flex bg-black px-4 py-3 items-center justify-between gap-4`}
            >
              <div className="w-4 h-4 rounded-full bg-red animate-pulse"></div>
              <Link href="" className="flex items-center gap-4 grow">
                <span>Mixed feelings</span>
                <Arrow colour="white" />
              </Link>
              <Link href="/chat" target="_blank">
                <MessageSquare />
              </Link>
              {/* <button>
              <div className="h-0.5 w-5 bg-white"></div>
            </button> */}
            </div>
            <iframe
              className="aspect-video w-screen md:w-full"
              width="100%"
              height="auto"
              src="https://www.youtube.com/embed/gMNHvXSW4iE?si=Uurr0Qin5XqUep8T"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>
        </div>
        <div
          className={`${
            !isHomePage && "lg:hidden"
          } p-6 max-w-2xl flex flex-col justify-between`}
        >
          <div className="hidden lg:block">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div>
            <Link href="" className="flex items-center gap-4 grow">
              <span>More info</span>
              <Arrow colour="white" />
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
