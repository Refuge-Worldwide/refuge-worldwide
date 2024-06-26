import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";
import { Formik, Form, Field } from "formik";
import { AiOutlineMail } from "react-icons/ai";
import { Arrow } from "../../icons/arrow";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiMailCheckFill, RiMailLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { updateArtistEmail } from "../../lib/contentful/calendar";
import * as Yup from "yup";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailModal({ artists, client }) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [artistLength, setArtistLength] = useState<number>(artists.length);
  const [artist, setArtist] = useState<any>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);

  useEffect(() => {
    // if we have added to the array and new artist doesn't have an email then show the modal
    if (artists.length > artistLength && !artists[artists.length - 1].email) {
      setArtist(artists[artists.length - 1]);
      setModalOpen(true);
    }

    setArtistLength(artists.length);
  }, [artists]);

  const handleOpenModal = (artist) => {
    setArtist(artist);
    setModalOpen(true);
  };

  const handleEmailSubmit = async (values) => {
    setIsSubmittingEmail(true);
    console.log(values);

    try {
      await updateArtistEmail(values.id, values.email, client);
      setIsSubmittingEmail(false);
      setModalOpen(false);
      toast.success("Email added");
    } catch (error) {
      console.log(error);
      toast.error("Error adding email");
      throw error;
    }
  };

  const initialValues = {
    id: artist?.value ? artist?.value : undefined,
    email: artist?.email?.join(", "),
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().test(
      "is-comma-space-separated-emails",
      "The field should be a list of comma and space separated emails",
      function (value) {
        if (!value) return true; // Skip validation if the value is empty

        // Split the value by comma and space
        const emails = value.split(", ");

        // Check if each email in the list is valid
        return emails.every((email) => emailRegex.test(email));
      }
    ),
  });

  return (
    <div className="-mt-6 mb-8">
      <div className="flex items-center gap-2">
        {artists.map((artist) => (
          <div key={artist.value}>
            <button
              type="button"
              className="text-tiny border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg flex items-center gap-1"
              onClick={() => handleOpenModal(artist)}
            >
              {artist.email ? <RiMailCheckFill /> : <RiMailLine />}
              {artist.label}
            </button>
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
            <div className="p-8 max-h-[95vh]">
              <Dialog.Close asChild>
                <button className="float-right lg:hidden" aria-label="Close">
                  <Cross />
                </button>
              </Dialog.Close>

              <p></p>
              <Formik
                form="artistEmailForm"
                initialValues={initialValues}
                onSubmit={handleEmailSubmit}
                validationSchema={validationSchema}
              >
                {({ values }) => (
                  <form id="artist-email">
                    <Field type="hidden" name="id" />
                    <InputField
                      name={`email`}
                      type="email"
                      label={`Email for ${artist.label}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleEmailSubmit(values)}
                      className="inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                      disabled={isSubmittingEmail}
                    >
                      <span className="underline">Save</span>
                      {isSubmittingEmail ? (
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
