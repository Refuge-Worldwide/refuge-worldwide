import Script from "next/script";
import { SyntheticEvent } from "react";
import { ActivePlayer, useGlobalStore } from "../hooks/useStore";
import { useState, useEffect } from "react";
import { getMixcloudKey } from "../util";
import useCookieConsent from "../hooks/useCookieConsent";
import Cookies from "js-cookie";

const USER_CONSENT_COOKIE_KEY = "cookie_consent";

export default function MixcloudPlayer() {
  const showUrl = useGlobalStore((state) => state.showUrl);
  const activePlayer = useGlobalStore((state) => state.activePlayer);
  const activePlayerSet = useGlobalStore((state) => state.activePlayerSet);

  const [showKey, setShowKey] = useState(null);

  const cookieConsent = Cookies.get(USER_CONSENT_COOKIE_KEY) ? true : false;

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

  if (!cookieConsent && showKey)
    return (
      <section className="fixed bottom-0 left-0 w-full md:w-2/3 lg:w-1/2 h-[100px] bg-black text-white text-small z-40">
        You need to accept cookies to listen to our archive. read more.
      </section>
    );

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
      <Script src="https://widget.mixcloud.com/media/js/widgetApi.js" />
    </>
  );
}
