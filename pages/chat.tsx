import PageMeta from "../components/seo/page";

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageMeta title="Chat | Refuge Worldwide" path="chat/" />

      <script
        async
        data-cfasync="false"
        id="cid0020000279925137861"
        src="https://st.chatango.com/js/gz/emb.js"
        style={{ width: "100%", height: "100%" }}
        dangerouslySetInnerHTML={{
          __html: `{"handle":"refugeworldwidechat","arch":"js","styles":{"a":"000000","b":100,"c":"FFFFFF","d":"FFFFFF","k":"000000","l":"000000","m":"000000","n":"FFFFFF","p":"10","q":"000000","r":100,"allowpm":0}}`,
        }}
      />
      <style jsx global>{`
        iframe {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

ChatPage.noLayout = true;
