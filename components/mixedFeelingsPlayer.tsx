import { useRouter } from "next/router";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Arrow } from "../icons/arrow";
import MessageSquare from "../icons/message-square";
import Image from "next/image";
import PlayLarge from "../icons/playLarge";
// import { Player } from "@livepeer/react";
import { AiOutlineCalendar } from "react-icons/ai";

export default function MixedFeelingsPlayer({
  isPlaying,
  onPlay,
  slug,
}: {
  isPlaying: boolean;
  onPlay: React.MouseEventHandler<HTMLButtonElement>;
  slug: string;
}) {
  const { pathname } = useRouter();
  const isHomePage = pathname === "/";
  const isChatroom = pathname === "/chat";

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0.1,
  });

  if (isHomePage || (!isHomePage && isPlaying)) {
    return (
      <div
        ref={ref}
        className={`flex flex-col lg:flex-row items-stretch bg-[#A5FDD1] text-black border-b-2 border-black ${
          isChatroom && "hidden lg:flex"
        }`}
      >
        <div
          className={`${
            isHomePage ? "aspect-video lg:grow" : "aspect-video grow lg:grow-0"
          } `}
        >
          <div
            className={
              ((!inView && isHomePage && isPlaying) ||
                (!isHomePage && isPlaying)) &&
              "lg:fixed lg:bottom-4 lg:right-4 z-50 w-full lg:w-1/3 lg:max-w-2xl min-w-md motion-safe:animate-slide-in"
            }
          >
            <div
              className={`${
                inView && isHomePage && "lg:hidden"
              } hidden lg:flex bg-black px-4 py-3 items-center justify-between gap-4 text-white`}
            >
              <div className="w-4 h-4 rounded-full bg-red animate-pulse"></div>
              <Link
                href={"/radio/" + slug}
                className="flex items-center gap-4 grow"
              >
                <span>Mixed Feelings</span>
                <Arrow colour="white" />
              </Link>
              <Link href="/chat" target="_blank">
                <MessageSquare />
              </Link>
            </div>
            <div className="relative bg-black">
              {/* <Player
                title="Waterfalls"
                playbackId={playbackId}
                showPipButton
                showTitle={false}
                aspectRatio="16to9"
                poster="/images/mixed-feelings.jpg"
                controls={{
                  autohide: 3000,
                }}
                theme={{
                  borderStyles: { containerBorderStyle: "hidden" },
                  radii: { containerBorderRadius: "10px" },
                }}
              /> */}
              <iframe
                src="https://lvpr.tv?v=80102glf4yhnwkmd&lowLatency=true&autoplay=true&muted=true"
                width="100%"
                height="auto"
                frameBorder="0"
                allowFullScreen
                title="Live video stream"
                className="aspect-video w-screen md:w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-same-origin allow-scripts"
              ></iframe>
              <div
                className={`absolute top-0 left-0 z-20 aspect-video w-screen md:w-full transition duration-300 ${
                  isPlaying && "opacity-0 pointer-events-none"
                }`}
                aria-hidden
              >
                <button
                  onClick={onPlay}
                  className="relative top-0 left-0 flex group w-full"
                  aria-label={
                    isPlaying ? "Pause Live Broadcast" : "Play Live Broadcast"
                  }
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
          } p-4 lg:p-8  lg:max-w-2xl flex flex-col justify-between lg:w-2/5 lg:border-l-2`}
        >
          <div className="hidden lg:block">
            <p className="lg:text-[1.7rem] xl:text-base">
              Refuge Worldwide is excited to expand on the next phase of the
              Mixed Feelings project with a new radio series, further exploring
              accessibility in the arts, embracing the diverse talents of
              disabled and d/Deaf artists in Berlin and beyond.
            </p>
          </div>
          <div className="flex justify-between items-center">
            <Link
              href={"/radio/" + slug}
              className="flex items-center gap-4 grow justify-center lg:justify-start underline lg:text-[1.7rem] xl:text-base"
            >
              <span>More info</span>
              <Arrow colour="black" />
            </Link>
            <Link href="/schedule">
              <AiOutlineCalendar />
              <span className="sr-only">Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
