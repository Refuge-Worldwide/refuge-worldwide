import Script from "next/script";
import { SyntheticEvent } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";
import { useState, useEffect } from "react";
import { getMixcloudKey } from "../util";
import SoundCloudPlayer from "./soundcloudPlayer";

export default function ArchivePlayer() {
  const showUrl = useGlobalStore((state) => state.showUrl);
  const showImage = useGlobalStore((state) => state.showImage);
  const showPageUrl = useGlobalStore((state) => state.showPageUrl);
  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  const [showKey, setShowKey] = useState(null);
  const [scRendered, setScRendered] = useState(false);
  const [scLeaving, setScLeaving] = useState(false);

  useEffect(() => {
    const isSoundcloud = activePlayer === ActivePlayer.SOUNDCLOUD && !!showUrl;
    if (isSoundcloud) {
      setScLeaving(false);
      setScRendered(true);
    } else if (scRendered) {
      setScLeaving(true);
      const t = setTimeout(() => {
        setScRendered(false);
        setScLeaving(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activePlayer, showUrl]);

  useEffect(() => {
    if (activePlayer === ActivePlayer.MIXCLOUD) {
      setShowKey(getMixcloudKey(showUrl));
    } else if (activePlayer === ActivePlayer.YOUTUBE) {
      var video_id = showUrl.split("v=")[1];
      var ampersandPosition = video_id.indexOf("&");
      if (ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
      }
      setShowKey(video_id);
    }
  }, [showUrl, activePlayer]);

  const handleIframeLoad = async (
    event: SyntheticEvent<HTMLIFrameElement, Event>
  ) => {
    try {
      activePlayerSet(ActivePlayer.MIXCLOUD);

      const widget = window.Mixcloud.PlayerWidget(event.currentTarget);

      await widget.ready;

      await widget.play();
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
            `https://player-widget.mixcloud.com/widget/iframe/?` +
            `hide_cover=1&` +
            `autoplay=1&` +
            `light=1&` +
            `mini=1&` +
            `feed=${showKey}`
          }
        />
      )}
      {scRendered && (
        <SoundCloudPlayer
          url={showUrl}
          image={showImage}
          leaving={scLeaving}
          showPageUrl={showPageUrl}
        />
      )}
      {activePlayer === ActivePlayer.YOUTUBE && showKey && (
        <div className="fixed bottom-0 left-0 w-full md:w-1/3 aspect-video">
          <iframe
            width="100%"
            height="100%"
            allow="autoplay"
            src={"https://www.youtube.com/embed/" + showKey + "?autoplay=1"}
          ></iframe>
        </div>
      )}
      <Script src="https://widget.mixcloud.com/media/js/widgetApi.js" />
    </>
  );
}
