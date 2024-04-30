import * as Dialog from "@radix-ui/react-dialog";
import Loading from "../../components/loading";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import { getInstaInfo } from "../../lib/contentful/calendar";
import { TfiSearch } from "react-icons/tfi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useRef } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CalendarInsta() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const instaText = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    dialogOpen &&
      getInstaInfo().then((info) => {
        console.log("get insta info");
        setData(info);
        setLoading(false);
      });
  }, [dialogOpen]);

  // useEffect(() => {
  //   onToggle(dialogOpen);
  // }, [dialogOpen]);

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
    >
      <Dialog.Trigger className="hover:bg-black/10 px-2 py-1 rounded-lg">
        Instagram text
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-7xl lg:max-h-[80vh] overflow-auto fixed top-16 left-1/2 transform -translate-x-1/2 z-50 border-black border p-4">
          <Dialog.Close asChild>
            <button className="float-right lg:hidden" aria-label="Close">
              <Cross />
            </button>
          </Dialog.Close>

          {isLoading ? (
            <Loading />
          ) : (
            <div className="relative">
              <p
                ref={instaText}
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                📻 {dayjs().format("dddd")}
                <br />
                <br />
                {data.map((show) => (
                  <>
                    {show.date} {show.title}
                    <br />
                  </>
                ))}
                <br />
                🎧 Listen live:
                <br />
                www.refugeworldwide.com
                <br />
                <br />
                💬 Chatroom:
                <br />
                www.refugeworldwide.com/chat
                <br />
                <br />
                🥂 Drinks: @oona.bar - Weserstr. 166, 12045 Berlin
                <br />
                <br />
                🎙Roll call:
                <br />
                {data.map((show) => (
                  <>
                    {show.instagramHandles} <br />
                  </>
                ))}
              </p>
              <button
                className="fixed top-2 right-2 z-10 hover:bg-black/10 px-2 py-1 rounded-lg border"
                onClick={() => {
                  navigator.clipboard.writeText(instaText.current?.innerText);
                }}
              >
                Copy text
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
