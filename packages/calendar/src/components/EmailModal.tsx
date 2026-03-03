import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Formik, Field } from "formik";
import { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiMailCheckFill, RiMailLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { updateArtistEmail } from "../lib/mutations";
import type { ManagementClient } from "../lib/mutations";
import type { CalendarConfig } from "../config";
import type { DropdownOption } from "../types";
import { Arrow } from "./icons/Arrow";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmails(value: string) {
  if (!value) return undefined;
  const emails = value.split(", ").map((e) => e.trim());
  if (!emails.every((e) => emailRegex.test(e))) {
    return "Enter comma-separated email addresses";
  }
  return undefined;
}

interface EmailModalProps {
  artists: DropdownOption[];
  client: ManagementClient;
  config: CalendarConfig;
}

export function EmailModal({ artists, client, config }: EmailModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [artistCount, setArtistCount] = useState(artists.length);
  const [artist, setArtist] = useState<DropdownOption | null>(null);

  useEffect(() => {
    if (
      artists.length > artistCount &&
      !artists[artists.length - 1].email?.length
    ) {
      setArtist(artists[artists.length - 1]);
      setModalOpen(true);
    }
    setArtistCount(artists.length);
  }, [artists]);

  const handleSubmit = async (values: { id: string; email: string }) => {
    try {
      await updateArtistEmail(values.id, values.email, client, config);
      setModalOpen(false);
      toast.success("Email saved");
    } catch {
      toast.error("Error saving email");
    }
  };

  const initialValues = {
    id: artist?.value ?? "",
    email: artist?.email?.join(", ") ?? "",
  };

  return (
    <div className="-mt-6 mb-8">
      <div className="flex flex-wrap items-center gap-2">
        {artists.map((a) => (
          <button
            key={a.value}
            type="button"
            className="text-tiny border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg flex items-center gap-1"
            onClick={() => {
              setArtist(a);
              setModalOpen(true);
            }}
          >
            {a.email?.length ? <RiMailCheckFill /> : <RiMailLine />}
            {a.label}
          </button>
        ))}
      </div>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Dialog.Content className="data-[state=open]:animate-contentShow bg-white w-full h-full lg:h-auto lg:max-w-3xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border p-8">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, isSubmitting, errors, touched }) => (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(values);
                  }}
                >
                  <Field type="hidden" name="id" />
                  <label htmlFor="email">Email for {artist?.label}</label>
                  <Field
                    id="email"
                    name="email"
                    type="text"
                    validate={validateEmails}
                    className={`pill-input ${
                      touched.email && errors.email
                        ? "border-red shadow-red"
                        : ""
                    }`}
                    placeholder="artist@example.com"
                  />
                  {touched.email && errors.email && (
                    <span className="text-red mt-2 text-small block">
                      {errors.email}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                  >
                    <span className="underline">Save</span>
                    {isSubmitting ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      <Arrow />
                    )}
                  </button>
                </form>
              )}
            </Formik>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
