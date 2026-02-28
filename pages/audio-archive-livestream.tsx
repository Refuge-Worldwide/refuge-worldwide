// @ts-nocheck
import MuxPlayer from "@mux/mux-player-react";
import Head from "next/head";
import { useRef, useState } from "react";

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

export default function LivestreamPage() {
  const playerRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  const toggleMute = () => {
    if (playerRef.current) {
      const next = !muted;
      playerRef.current.muted = next;
      setMuted(next);
    }
  };

  const togglePause = () => {
    if (playerRef.current) {
      if (paused) {
        try {
          playerRef.current.currentTime = Infinity;
        } catch {
          // on-demand stream, no seek needed
        }
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
      setPaused(!paused);
    }
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
        <div className="relative w-full aspect-square md:aspect-auto md:h-full">
          <MuxPlayer
            ref={playerRef}
            playbackId="IAGzx00zHKjaGzw49c02TYY5ALJQcEwqpwT2H45L01Oa0100"
            streamType="live"
            autoPlay
            muted
            style={{
              width: "100%",
              height: "100%",
              "--controls": "none",
              "--media-object-fit": "cover",
              "--media-object-position": "center",
            }}
          />

          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
            </button>
            <button
              onClick={togglePause}
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white"
              aria-label={paused ? "Play" : "Pause"}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

LivestreamPage.noLayout = true;
