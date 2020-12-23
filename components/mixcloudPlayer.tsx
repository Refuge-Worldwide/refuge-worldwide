import { useEffect, useState } from "react";
import { useMixcloudShowKey } from "../hooks/useMixcloudPlayer";
import useScript from "../hooks/useScript";

// events: {
//   buffering: {on: () => Promise<void>;, off: () => void};
// ended: {on: () => void, off: () => void}
// error: {on: () => void, off: () => void}
// pause: {on: () => void, off: () => void}
// play: {on: () => void, off: () => void}
// progress: {on: () => void, off: () => void}}

interface PlayerWidget {
  getCurrentKey: () => Promise<string>;
  getDuration: () => Promise<number>;
  getIsPaused: () => Promise<boolean>;
  getPosition: () => Promise<number>;
  getVolume: () => Promise<number>;
  pause: () => Promise<void>;
  play: () => Promise<void>;
  togglePlay: () => Promise<void>;
  ready: Promise<void>;
}

export default function MixcloudPlayer({ mini = false }: { mini?: boolean }) {
  const [key] = useMixcloudShowKey();

  const status = useScript("http://widget.mixcloud.com/media/js/widgetApi.js");

  useEffect(() => {
    async function handleMixcloudPlayer() {
      const iframe = document.getElementById("mixcloud");

      // @ts-ignore
      const widget: PlayerWidget = window.Mixcloud.PlayerWidget(iframe);

      widget.ready.then(async function () {
        // const isPaused = await widget.getIsPaused();
        // if (isPaused) {
        //   await widget.play();
        // }
      });
    }

    if (status === "ready" && typeof key === "string") {
      handleMixcloudPlayer();
    }
  }, [status, key]);

  if (key) {
    return (
      <iframe
        loading="eager"
        id="mixcloud"
        height={mini ? 60 : 120}
        className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2"
        {...{
          src:
            `https://www.mixcloud.com/widget/iframe/?` +
            `hide_cover=1&` +
            `mini=${mini ? 1 : 0}&` +
            `feed=${encodeURIComponent(key)}`,
        }}
      />
    );
  }
  return null;
}
