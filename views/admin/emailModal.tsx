import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";

export default function EmailModal({ artists }) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [artistLength, setArtistLength] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (artists.length > artistLength) {
      // setDialogOpen(true);
    }

    setArtistLength(artists.length);

    // if we have added to the array and new artist doesn't have an email then show the modal
  }, [artists]);

  // const handleSubmit = async (values, actions) => {
  //   setCalendarLoading(true);
  //   console.log("submitting the form");
  //   console.log(values);
  //   const httpMethod = values.id ? "PATCH" : "POST";
  //   const JSONData = JSON.stringify(values);
  //   const endpoint = "/api/calendar";
  //   const options = {
  //     method: httpMethod,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSONData,
  //   };
  //   const response = await fetch(endpoint, options);
  //   if (response.status === 400) {
  //     // Validation error
  //     actions.setSubmitting(false);
  //   } else if (response.ok) {
  //     // successful
  //     console.log("email added successfully");

  //     setIsSubmitting(false);
  //     setDialogOpen(false);
  //   } else {
  //     // unknown error
  //     actions.setSubmitting(false);
  //   }
  // };

  return (
    <div>
      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen fixed top-0 left-0 bg-black opacity-90 z-50" />
          <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-3xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
            <div className="relative p-8 overflow-y-scroll max-h-[95vh]">
              <Dialog.Close asChild>
                <button className="float-right" aria-label="Close">
                  <Cross />
                </button>
              </Dialog.Close>
              <InputField
                name={`email`}
                type="email"
                label={`Email for ${
                  artists.at(-1).label
                } required, pop it in below`}
                required
              />
              {/* <pre className="text-white bg-black h-96 overflow-scroll">
                {JSON.stringify(artists, null, 2)}
              </pre> */}
              {/* <p>{artistLength}</p> */}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
