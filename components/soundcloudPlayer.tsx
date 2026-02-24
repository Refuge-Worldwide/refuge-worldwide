import { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import Image from "next/image";
import Link from "next/link";
import Pause from "../icons/pause";
import Play from "../icons/play";
import Soundcloud from "../icons/soundcloud";
import loaders from "../lib/loaders";

type StreamData = {
  id: number;
  streamUrl: string;
  waveform: string;
};

export default function SoundCloudPlayer({
  url,
  image,
  leaving,
  showPageUrl,
}: {
  url: string;
  image?: string;
  leaving?: boolean;
  showPageUrl?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);

  // Trigger enter transition after mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Set browser/OS media session metadata so the image appears in the system player
  useEffect(() => {
    if (!("mediaSession" in navigator) || !image) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Refuge Worldwide",
      artwork: [
        {
          src: `${image}?w=384&h=384&fit=fill&f=faces`,
          sizes: "384x384",
          type: "image/jpeg",
        },
        {
          src: `${image}?w=512&h=512&fit=fill&f=faces`,
          sizes: "512x512",
          type: "image/jpeg",
        },
      ],
    });
  }, [image]);
  const [data, setData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setError(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    fetch(`/api/soundcloud-stream?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: StreamData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[SoundCloudPlayer]", err);
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  useEffect(() => {
    if (!data?.streamUrl || !audioRef.current) return;
    const audio = audioRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(data.streamUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play().catch(console.error);
      });
      return () => hls.destroy();
    } else {
      // Safari — native HLS support
      audio.src = data.streamUrl;
      audio.play().catch(console.error);
    }
  }, [data]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2 bg-black text-white flex items-stretch h-16 transition-transform duration-300 ease-out ${
        visible && !leaving ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Artwork */}
      {image ? (
        <div className="relative h-16 w-16 flex-shrink-0">
          {showPageUrl ? (
            <Link href={showPageUrl} className="block w-full h-full">
              <Image
                src={image}
                loader={loaders.contentfulNoCrop}
                fill
                alt=""
                className="object-cover"
              />
            </Link>
          ) : (
            <Image
              src={image}
              loader={loaders.contentfulNoCrop}
              fill
              alt=""
              className="object-cover"
            />
          )}
        </div>
      ) : (
        <div className="h-16 w-16 bg-white/10 flex-shrink-0" />
      )}

      <div className="flex flex-1 items-center gap-3 px-4">
        {/* Play / Pause */}
        <button
          className="h-6 w-6 flex-shrink-0"
          onClick={togglePlay}
          disabled={loading || !!error}
          aria-label={playing ? "Pause" : "Play"}
        >
          {loading ? (
            <div className="h-full w-full animate-pulse bg-white/25 rounded-full" />
          ) : playing ? (
            <Pause />
          ) : (
            <Play />
          )}
        </button>

        {/* Scrubber */}
        <div
          className="flex-1 h-8 cursor-pointer flex items-center group"
          onClick={handleSeek}
        >
          <div className="relative w-full h-px bg-white/25">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-white"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time */}
        <span className="text-white text-small tabular-nums flex-shrink-0">
          {error ? "Failed to load" : formatTime(currentTime)}
        </span>

        {/* SoundCloud link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open on SoundCloud"
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <Soundcloud />
        </a>
      </div>
    </div>
  );
}
