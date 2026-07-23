import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Cross } from "../icons/cross";
import { SupportPicker } from "./supportPicker";

export function SupportModal({
  open,
  onOpenChange,
  showFindOutMoreLink = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hide this when the modal is opened from the /support page itself. */
  showFindOutMoreLink?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-4 sm:p-8">
          <div className="flex justify-end mb-2">
            <Dialog.Close className="focus:outline-none focus:ring-4">
              <span className="sr-only">Close</span>
              <span aria-hidden>
                <Cross size={20} colour="black" />
              </span>
            </Dialog.Close>
          </div>

          <Dialog.Title className="font-serif text-large text-center mb-2">
            Support Refuge Worldwide
          </Dialog.Title>
          <Dialog.Description className="text-center text-small opacity-60 mb-8 max-w-sm mx-auto">
            Help keep independent radio alive, in whatever amount works for you.
          </Dialog.Description>

          <SupportPicker />

          {showFindOutMoreLink && (
            <p className="text-center text-small mt-6">
              <Link
                href="/support"
                onClick={() => onOpenChange(false)}
                className="underline hover:no-underline"
              >
                Find out more
              </Link>
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
