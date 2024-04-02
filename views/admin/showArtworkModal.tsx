import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";
import { Formik, Form, Field } from "formik";
import { Arrow } from "../../icons/arrow";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { RxDotsVertical } from "react-icons/rx";

export default function ShowArtworkModal() {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEmailSubmit = async (values) => {
    setIsSubmitting(true);
    console.log(values);
    try {
      await fetch("/api/admin/artwork-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      setIsSubmitting(false);
      setDialogOpen(false);
      toast.success("Artwork emails send");
    } catch (error) {
      console.log(error);
      toast.error("Error sending artwork emails");
      throw error;
    }
  };

  const initialValues = {
    date: dayjs().add(2, "days").format("YYYY-MM-DD"),
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="hidden lg:block hover:bg-black/10 rounded-lg cursor-pointer">
          <RxDotsVertical />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="border border-black p-2 bg-white shadow-md text-small flex flex-col items-start"
      >
        <Dialog.Root
          open={dialogOpen}
          onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
        >
          <DropdownMenu.Item
            asChild
            className="hover:bg-black/10 px-2 py-1 rounded-lg"
            onSelect={(e) => e.preventDefault()}
          >
            <Dialog.Trigger>Send artwork images</Dialog.Trigger>
          </DropdownMenu.Item>
          <Dialog.Portal>
            <Dialog.Overlay className="data-[state=open]:animate-overlayShow  w-screen h-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm" />
            <Dialog.Content className="data-[state=open]:animate-contentShow bg-white w-full h-full lg:h-auto lg:max-w-3xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
              <div className="p-8 max-h-[95vh]">
                <Dialog.Close
                  className="float-right lg:hidden"
                  aria-label="Close"
                  asChild
                >
                  <button>
                    <Cross />
                  </button>
                </Dialog.Close>

                <Formik
                  form="artistEmailForm"
                  initialValues={initialValues}
                  onSubmit={handleEmailSubmit}
                >
                  {({ values }) => (
                    <form id="artist-email">
                      <InputField
                        name={`date`}
                        type="date"
                        label="Pick a date to send artwork emails for"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleEmailSubmit(values)}
                        className="inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        <span className="underline">Send it!</span>
                        {isSubmitting ? (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        ) : (
                          <Arrow />
                        )}
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
