import { SyntheticEvent } from "react";
import useScript from "../hooks/useScript";
import { showKey } from "../lib/mixcloud";

interface PlayerWidget {
  events: {
    buffering: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    ended: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    error: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    pause: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    play: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
    progress: {
      on: (e: any) => void;
      off: (e: any) => void;
    };
  };
  getCurrentKey: () => Promise<string>;
  getDuration: () => Promise<number>;
  getIsPaused: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getVolume: () => Promise<number>;
  pause: () => Promise<void>;
  play: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  ready: Promise<void>;
}

export default function MixcloudPlayer({ mini = true }: { mini?: boolean }) {
  const key = showKey.useValue();

  const status = useScript("//widget.mixcloud.com/media/js/widgetApi.js");

  let widget: PlayerWidget = null;

  const onErrorListener = (event: any) => {
    console.error("[Mixcloud Event - error]", event);
  };

  const onPauseListener = () => {
    console.log("[Mixcloud Event - pause]");
  };

  const onPlayListener = () => {
    console.log("[Mixcloud Event - play]");
  };

  const handleIframeLoad = async (
    e: SyntheticEvent<HTMLIFrameElement, Event>
  ) => {
    console.log("[Mixcloud]", "iframe Loaded");

    // @ts-ignore
    widget = window?.Mixcloud?.PlayerWidget(e.currentTarget);

    widget.ready.then(async () => {
      console.log("[Mixcloud]", "PlayerWidget Ready");

      widget.events.error.on(onErrorListener);
      widget.events.pause.on(onPauseListener);
      widget.events.play.on(onPlayListener);

      try {
        await widget.togglePlay();
      } catch (error) {
        console.error("[Mixcloud - Play Error]", error);
      }
    });
  };

  if (status === "ready" && key) {
    return (
      <iframe
        onLoad={handleIframeLoad}
        id="mixcloud-player"
        height={mini ? 60 : 120}
        className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2"
        {...{
          src:
            `https://www.mixcloud.com/widget/iframe/?` +
            `hide_cover=1&` +
            `mini=${mini ? 1 : 0}&` +
            `feed=${key}`,
        }}
      />
    );
  }

  return null;
}
