import * as Dialog from "@radix-ui/react-dialog";
import Loading from "../../components/loading";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import { getInstaInfo } from "../../lib/contentful/calendar";
import { TfiSearch } from "react-icons/tfi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CalendarInsta() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(true);
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getInstaInfo().then((info) => {
      setData(info);
      setLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   onToggle(dialogOpen);
  // }, [dialogOpen]);

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
    >
      <Dialog.Trigger asChild>
        <button className="absolute top-1 lg:top-1.5 right-2 lg:right-9 hidden lg:block">
          <TfiSearch />
        </button>
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
            <p contentEditable={true}>
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
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
