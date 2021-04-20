import { useEffect, useRef } from "react";
import PageMeta from "../components/seo/page";

export default function ChatPage() {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const tag = document.createElement("script");

    tag.async = false;
    tag.defer = true;
    tag.id = "cid0020000279925137861";
    tag.src = "https://st.chatango.com/js/gz/emb.js";
    tag.innerText = JSON.stringify({
      handle: "refugeworldwidechat",
      arch: "js",
      styles: {
        a: "000000",
        b: 100,
        c: "FFFFFF",
        d: "FFFFFF",
        k: "000000",
        l: "000000",
        m: "000000",
        n: "FFFFFF",
        p: "10",
        q: "000000",
        r: 100,
        allowpm: 0,
      },
    });

    ref.current.appendChild(tag);
  });

  return (
    <div ref={ref} className="flex flex-col min-h-screen">
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />

      <style jsx global>{`
        iframe {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

ChatPage.noLayout = true;
