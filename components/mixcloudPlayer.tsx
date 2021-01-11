import { SyntheticEvent } from "react";
import { livePlayerState } from "../hooks/usePlayerState";
import useScript from "../hooks/useScript";
import { playerWidget, showKey } from "../lib/mixcloud";
import { PlayerWidget } from "../types/mixcloud";

export default function MixcloudPlayer({ mini = true }: { mini?: boolean }) {
  const [isLivePlaying, setIsLivePlaying] = livePlayerState.use();

  const key = showKey.useValue();

  const status = useScript("//widget.mixcloud.com/media/js/widgetApi.js");

  const [, playerWidgetStateSet] = playerWidget.use();

  const onErrorListener = (event: any) => {
    console.error("[Mixcloud]", "on.error", event);
  };

  const onPauseListener = () => {
    console.log("[Mixcloud]", "on.pause");
  };

  const onPlayListener = () => {
    console.log("[Mixcloud]", "on.play");

    /**
     * @note This should pause the Live Player when someone starts a Mixcloud show
     */
    if (isLivePlaying) {
      setIsLivePlaying(false);
    }
  };

  const handleIframeLoad = async ({
    currentTarget,
  }: SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.log("[Mixcloud]", "iframe Embed Loaded");

    // @ts-ignore
    const widget: PlayerWidget = window?.Mixcloud?.PlayerWidget(currentTarget);

    playerWidgetStateSet(widget);

    widget.ready.then(async () => {
      console.log("[Mixcloud]", "PlayerWidget Ready");

      widget.events.error.on(onErrorListener);
      widget.events.pause.on(onPauseListener);
      widget.events.play.on(onPlayListener);

      try {
        console.log("[Mixcloud]", "Attempt Play");

        await widget.play();
      } catch (error) {
        console.error("[Mixcloud]", "Widget play() Error", error);
      }
    });
  };

  if (status === "ready" && key) {
    return (
      <iframe
        allow="autoplay"
        onLoad={handleIframeLoad}
        id="mixcloud-player"
        height={mini ? 60 : 120}
        className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2"
        src={
          `https://www.mixcloud.com/widget/iframe/?` +
          `hide_cover=1&` +
          `autoplay=1&` +
          `light=1&` +
          `mini=${mini ? 1 : 0}&` +
          `feed=${key}`
        }
      />
    );
  }

  return null;
}
