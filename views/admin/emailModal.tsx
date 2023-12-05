import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";
import { Formik, Form, Field } from "formik";
import { AiOutlineMail } from "react-icons/ai";
import { Arrow } from "../../icons/arrow";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { updateArtistEmail } from "../../lib/contentful/calendar";

export default function EmailModal({ artists }) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [artistLength, setArtistLength] = useState<number>(0);
  const [artist, setArtist] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // useEffect(() => {
  //   if (artists.length > artistLength) {
  //     // setDialogOpen(true);
  //   }

  //   setArtistLength(artists.length);

  //   // if we have added to the array and new artist doesn't have an email then show the modal
  // }, [artists]);

  const handleOpenModal = (artist) => {
    setArtist(artist);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      // artist = await updateCalendarShow(values);

      setModalOpen(false);
      // toast.success(method == "update" ? "Show updated" : "Show created");
    } catch (error) {
      console.log(error);
      // toast.error(
      //   method == "update" ? "Error updating show" : "Error creating show"
      // );
      throw error;
    }
  };

  const initialValues = {
    id: artist?.value ? artist?.value : null,
    email: null,
  };

  return (
    <div className="-mt-6 mb-8">
      <div className="flex items-center gap-2">
        {artists.map((artist) => (
          <div key={artist.value}>
            {!artist.email && (
              <button
                type="button"
                className="text-small border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg flex items-center gap-1"
                onClick={() => handleOpenModal(artist)}
              >
                <AiOutlineMail />
                {artist.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <Dialog.Root
        open={modalOpen}
        onOpenChange={(modalOpen) => setModalOpen(modalOpen)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-overlayShow  w-screen h-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-contentShow bg-white w-full h-full lg:h-auto lg:max-w-3xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
            <div className="relative p-8 overflow-y-scroll max-h-[95vh]">
              <Dialog.Close asChild>
                <button className="float-right" aria-label="Close">
                  <Cross />
                </button>
              </Dialog.Close>

              <p></p>
              <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                {({ values, isSubmitting, dirty, setFieldValue }) => (
                  <form id="artist-email">
                    <Field type="hidden" name="id" />
                    <InputField
                      name={`email`}
                      type="email"
                      label={`Add email for ${artist.label}`}
                      required
                    />
                    <button
                      type="submit"
                      // onClick={() => handleSubmit(values)}
                      className="inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <span className="underline">
                        {values?.id ? "Save" : "Add"}
                      </span>
                      {isSubmitting ? (
                        <AiOutlineLoading3Quarters className="animate-spin" />
                      ) : (
                        <Arrow />
                      )}
                    </button>
                  </form>
                )}
              </Formik>

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
