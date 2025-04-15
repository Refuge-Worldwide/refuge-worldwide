import * as Dialog from "@radix-ui/react-dialog";
import Loading from "../../components/loading";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import { getWeeklyInstaInfo } from "../../lib/contentful/calendar";
import { TfiSearch } from "react-icons/tfi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useRef } from "react";
import toast from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CalendarInstaWeekly() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const instaText = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    dialogOpen &&
      getWeeklyInstaInfo().then((info) => {
        setData(info);
        setLoading(false);
      });
  }, [dialogOpen]);

  const copyText = () => {
    navigator.clipboard
      .writeText(instaText.current?.innerText)
      .then(() => {
        toast.success("Copied to your clipboard");
      })
      .catch(() => {
        toast.error("Uh oh, something went wrong :/");
      });
  };

  useEffect(() => {
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }, [copied]);

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
    >
      <Dialog.Trigger className="hover:bg-black/10 px-2 py-1 rounded-lg">
        Weekly instagram handles
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-7xl lg:max-h-[80vh] overflow-auto fixed top-16 left-1/2 transform -translate-x-1/2 z-50 border-black border p-4 pt-16">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="relative">
              <p
                ref={instaText}
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {data.map((day) => (
                  <span key={day.day}>
                    {day.day}: {day.handles}
                    <br />
                    <br />
                  </span>
                ))}
              </p>
              <div className="flex gap-2 fixed top-2 right-2 z-10">
                <button
                  className="hover:bg-black/10 px-2 py-1 rounded-lg border"
                  onClick={() => copyText()}
                >
                  <span>Copy it</span>
                </button>
                <Dialog.Close asChild>
                  <button className="float-right lg:hidden" aria-label="Close">
                    <Cross />
                  </button>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
