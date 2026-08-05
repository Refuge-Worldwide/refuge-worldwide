import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Cross } from "../icons/cross";

export function LikeSignInModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white p-4 sm:p-8">
          <div className="flex justify-end mb-2">
            <Dialog.Close className="focus:outline-none focus:ring-4">
              <span className="sr-only">Close</span>
              <span aria-hidden>
                <Cross size={20} colour="black" />
              </span>
            </Dialog.Close>
          </div>

          <Dialog.Title className="font-serif text-large text-center mb-2">
            Sign in to like shows
          </Dialog.Title>
          <Dialog.Description className="text-center text-small opacity-60 mb-8 max-w-sm mx-auto">
            Liking shows is a perk for Refuge Worldwide supporters. Sign in to
            your account, or become a supporter to get started.
          </Dialog.Description>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link
              href="/support"
              onClick={() => onOpenChange(false)}
              className="w-full text-center bg-black text-white rounded-full py-3 px-6 text-small hover:bg-black/80 transition-colors"
            >
              Become a supporter
            </Link>
            <Link
              href="/signin"
              onClick={() => onOpenChange(false)}
              className="w-full text-center text-small underline hover:no-underline py-2"
            >
              Already a supporter? Sign in
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
