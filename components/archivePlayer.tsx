import Script from "next/script";
import { SyntheticEvent } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";
import { useState, useEffect } from "react";
import { getMixcloudKey } from "../util";

export default function ArchivePlayer() {
  const showUrl = useGlobalStore((state) => state.showUrl);
  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  const [showKey, setShowKey] = useState(null);

  useEffect(() => {
    console.log("player changed");
    if (activePlayer === ActivePlayer.MIXCLOUD) {
      setShowKey(getMixcloudKey(showUrl));
    } else if (activePlayer === ActivePlayer.SOUNDCLOUD) {
      const encodedShowUrl = encodeURI(showUrl);
      const scResolveUrl = "/api/soundcloud-resolve?url=" + encodedShowUrl;
      fetch(scResolveUrl)
        .then((res) => res.json())
        .then((data) => {
          setShowKey(data);
        });
    } else if (activePlayer === ActivePlayer.YOUTUBE) {
      var video_id = showUrl.split("v=")[1];
      var ampersandPosition = video_id.indexOf("&");
      if (ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
      }
      console.log(video_id);
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
      {activePlayer === ActivePlayer.SOUNDCLOUD && showKey && (
        <iframe
          width="100%"
          height={120}
          allow="autoplay"
          className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2"
          src={
            `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/` +
            `${showKey}&` +
            `auto_play=true&` +
            `buying=false&` +
            `sharing=false&` +
            `download=false&` +
            `show_artwork=true&` +
            `show_playcount=false&` +
            `show_user=false&` +
            `color=000000`
          }
        ></iframe>
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
