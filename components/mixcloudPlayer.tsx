import Script from "next/script";
import { SyntheticEvent } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";

export default function MixcloudPlayer() {
  const showKey = useGlobalStore((state) => state.showKey);
  const showKeySet = useGlobalStore((state) => state.showKeySet);
  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  const handleIframeLoad = async (
    event: SyntheticEvent<HTMLIFrameElement, Event>
  ) => {
    try {
      activePlayerSet(ActivePlayer.MIXCLOUD);

      const widget = window.Mixcloud.PlayerWidget(event.currentTarget);

      await widget.ready;

      await widget.play();

      widget.events.ended.on(() => {
        console.log("ended show playback");
        showKeySet("/refugeworldwide/in-depth-nat-wendell-28-mar-2023/");
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {activePlayer === ActivePlayer.MIXCLOUD && showKey && (
        <iframe
          allow="autoplay"
          onLoad={handleIframeLoad}
          id="mixcloud-player"
          height={60}
          className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2"
          src={
            `https://www.mixcloud.com/widget/iframe/?` +
            `hide_cover=1&` +
            `autoplay=1&` +
            `light=1&` +
            `mini=1&` +
            `feed=${showKey}`
          }
        />
      )}

      <Script src="https://widget.mixcloud.com/media/js/widgetApi.js" />
    </>
  );
}
