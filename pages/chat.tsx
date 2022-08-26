import Script from "next/script";
import { useEffect, useRef } from "react";
import PageMeta from "../components/seo/page";

export default function ChatPage() {
  const ref = useRef<HTMLDivElement>();

  return (
    <div ref={ref} className="flex flex-col min-h-screen">
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />

      <Script
        id="cid0020000279925137861"
        src="https://st.chatango.com/js/gz/emb.js"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      <style jsx global>{`
        iframe {
          position: absolute;

          top: 0px;
          right: 0px;
          left: 0px;
          bottom: 0px;

          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

ChatPage.noLayout = true;
