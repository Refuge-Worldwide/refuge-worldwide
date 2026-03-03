import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Formik, Form, Field, FieldArray } from "formik";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxDownload, RxCopy, RxLink1, RxExternalLink } from "react-icons/rx";
import { RiDeleteBin7Line } from "react-icons/ri";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import type { CalendarConfig } from "../config";
import type { ShowFormValues, DropdownOption, MutationResult } from "../types";
import type { ManagementClient } from "../lib/mutations";
import {
  createCalendarShow,
  updateCalendarShow,
  deleteCalendarShow,
  createArtist,
} from "../lib/mutations";
import { InputField } from "./fields/InputField";
import { CheckboxField } from "./fields/CheckboxField";
import { MultiSelectField } from "./fields/MultiSelectField";
import { ArtistMultiSelectField } from "./fields/ArtistMultiSelectField";
import { EmailModal } from "./EmailModal";
import { Arrow } from "./icons/Arrow";

interface ShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShow: any;
  config: CalendarConfig;
  client: ManagementClient;
  searchEndpoint?: string;
  onShowSaved: (
    show: MutationResult,
    values: ShowFormValues,
    method: "create" | "update"
  ) => void;
  onShowDeleted: (id: string) => void;
}

export function ShowDialog({
  open,
  onOpenChange,
  selectedShow,
  config,
  client,
  searchEndpoint = "/api/admin/search",
  onShowSaved,
  onShowDeleted,
}: ShowDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const statusOptions = [
    { value: config.statusValues.tbc, label: config.statusValues.tbc },
    {
      value: config.statusValues.confirmed,
      label: config.statusValues.confirmed,
    },
    {
      value: config.statusValues.submitted,
      label: config.statusValues.submitted,
    },
  ];

  const initialValues: ShowFormValues & {
    hasExtraArtists: boolean;
    extraArtists: Array<{ name: string; pronouns?: string; email?: string }>;
  } = {
    id: selectedShow?.id,
    title: selectedShow?.title,
    type: selectedShow?.extendedProps?.type ?? config.typeValues.live,
    start: selectedShow?.startStr ?? "",
    end: selectedShow?.endStr ?? "",
    artists: selectedShow?.extendedProps?.artists ?? [],
    status: selectedShow?.extendedProps?.status
      ? {
          value: selectedShow.extendedProps.status,
          label: selectedShow.extendedProps.status,
        }
      : { value: config.statusValues.tbc, label: config.statusValues.tbc },
    isFeatured: selectedShow?.extendedProps?.isFeatured ?? false,
    hasExtraArtists: false,
    extraArtists: [{ name: "", pronouns: "", email: "" }],
  };

  const handleSubmit = async (values: typeof initialValues, actions: any) => {
    const method = values.id ? "update" : "create";
    try {
      if (values.hasExtraArtists) {
        for (const artist of values.extraArtists) {
          const newArtist = await createArtist(artist, client, config);
          values.artists.push(newArtist);
        }
      }

      const show =
        method === "update"
          ? await updateCalendarShow(
              values as ShowFormValues & { id: string },
              client,
              config
            )
          : await createCalendarShow(values as ShowFormValues, client, config);

      actions.setSubmitting(false);
      actions.setStatus("submitted");
      onShowSaved(show, values as ShowFormValues, method);
    } catch (error) {
      toast.error(
        method === "update" ? "Error updating show" : "Error creating show"
      );
      actions.setSubmitting(false);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteCalendarShow(id, client, config);
      onShowDeleted(id);
    } catch {
      toast.error("Error deleting show");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadImages = async () => {
    const images = selectedShow?.extendedProps?.images;
    if (!images?.length) {
      toast.error("Show has no images");
      return;
    }
    for (let i = 0; i < images.length; i++) {
      const url = images[i].replace("http://", "https://");
      const blob = await fetch(url).then((r) => r.blob());
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedShow.title} (${i + 1})`;
      link.click();
      link.remove();
    }
  };

  const contentfulBase =
    config.contentfulAppUrl ??
    `https://app.contentful.com/spaces/${config.contentful.spaceId}`;

  const siteBase =
    config.siteUrl ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000/";

  const copySubmissionLink = (showId: string) => {
    if (!config.submissionFormPath) return;
    const url = `${siteBase}${config.submissionFormPath}?id=${showId}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Submission link copied"),
      () => toast.error("Could not copy link")
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-contentShow bg-white w-full h-full lg:h-auto lg:max-w-4xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <div className="relative overflow-y-auto max-h-[95vh]">
                {/* Header */}
                <div className="px-8 py-4 sticky top-0 bg-white border-b border-black flex justify-between gap-4 items-center z-20">
                  <Dialog.Title asChild className="grow">
                    <h5 className="font-sans font-medium">
                      {selectedShow?.title ? "Edit" : "New"} show
                    </h5>
                  </Dialog.Title>

                  {values?.id && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadImages}
                        className="hover:bg-black/10 p-2 rounded-lg"
                        title="Download images"
                      >
                        <RxDownload />
                      </button>
                      <button
                        type="button"
                        className="hover:bg-black/10 p-2 rounded-lg hidden lg:block"
                        title="Duplicate show"
                        onClick={() => {
                          setFieldValue("id", undefined);
                          toast.success(
                            "Show duplicated — change required fields and save."
                          );
                        }}
                      >
                        <RxCopy />
                      </button>
                      {config.submissionFormPath && (
                        <button
                          type="button"
                          onClick={() =>
                            values.id && copySubmissionLink(values.id)
                          }
                          className="hover:bg-black/10 px-2 py-1 rounded-lg"
                          title="Copy submission link"
                        >
                          <RxLink1 />
                        </button>
                      )}
                      <a
                        className="hover:bg-black/10 px-2 py-1 rounded-lg"
                        target="_blank"
                        rel="noreferrer"
                        href={`${contentfulBase}/environments/master/entries/${selectedShow.id}`}
                      >
                        <RxExternalLink />
                      </a>
                    </div>
                  )}
                </div>

                {/* Form */}
                <Form id="calendarShow">
                  <div className="p-8">
                    <Field type="hidden" name="id" />

                    {/* Show type */}
                    <div className="mb-8 flex items-center gap-6">
                      <RadioGroup.Root
                        className="flex flex-1"
                        name="Type of show"
                        onValueChange={(v) => setFieldValue("type", v)}
                        value={values.type}
                      >
                        <RadioGroup.Item value={config.typeValues.live} asChild>
                          <label className="data-[state=checked]:bg-blue block cursor-pointer pill-input rounded-tr-none rounded-br-none py-3 text-center">
                            {config.typeValues.live}
                          </label>
                        </RadioGroup.Item>
                        <RadioGroup.Item
                          value={config.typeValues.prerecord}
                          asChild
                        >
                          <label className="data-[state=checked]:bg-blue block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center">
                            {config.typeValues.prerecord}
                          </label>
                        </RadioGroup.Item>
                      </RadioGroup.Root>
                      <CheckboxField
                        name="isFeatured"
                        label="🍊"
                        className="!mb-0"
                      />
                    </div>

                    {/* Title */}
                    <InputField name="title" label="Show name" type="text" />

                    {/* Artists */}
                    <ArtistMultiSelectField
                      label="Artist(s)"
                      name="artists"
                      limit={10}
                      value={initialValues.artists}
                      searchEndpoint={searchEndpoint}
                    />

                    {/* Artist emails */}
                    <EmailModal
                      artists={values.artists}
                      client={client}
                      config={config}
                    />

                    {/* New artist */}
                    <CheckboxField
                      name="hasExtraArtists"
                      label="New artist?"
                      size="small"
                    />

                    {values.hasExtraArtists && (
                      <fieldset className="mb-8">
                        <legend className="mb-6">New artist(s)</legend>
                        <FieldArray
                          name="extraArtists"
                          render={(helpers) => (
                            <div>
                              {values.extraArtists.map((_, index) => (
                                <div
                                  key={`extraArtist-${index}`}
                                  className="mb-8 border border-black p-8 relative"
                                >
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      className="float-right"
                                      onClick={() => helpers.remove(index)}
                                    >
                                      ×
                                    </button>
                                  )}
                                  <InputField
                                    name={`extraArtists.${index}.name`}
                                    type="text"
                                    label="Name"
                                    required
                                  />
                                  <InputField
                                    name={`extraArtists.${index}.pronouns`}
                                    type="text"
                                    label="Pronouns"
                                  />
                                  <InputField
                                    name={`extraArtists.${index}.email`}
                                    type="email"
                                    label="Email"
                                    required
                                  />
                                </div>
                              ))}
                              <button
                                type="button"
                                className="underline"
                                onClick={() =>
                                  helpers.push({
                                    name: "",
                                    pronouns: "",
                                    email: "",
                                  })
                                }
                              >
                                Add another artist
                              </button>
                            </div>
                          )}
                        />
                      </fieldset>
                    )}

                    {/* Dates */}
                    <div className="lg:grid lg:grid-cols-2 gap-4">
                      <InputField
                        name="start"
                        label="Start"
                        required
                        type="datetime-local"
                      />
                      <InputField
                        name="end"
                        label="End"
                        required
                        type="datetime-local"
                      />
                    </div>

                    {/* Status */}
                    <MultiSelectField
                      label="Status"
                      name="status"
                      options={statusOptions}
                      limit={1}
                      value={[initialValues.status]}
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center lg:sticky lg:bottom-0 lg:bg-white py-4 px-8 border-t border-black">
                    <button
                      type="submit"
                      className="hover:bg-black/10 py-2 px-4 rounded-lg inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
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
                    {values?.id && (
                      <button
                        type="button"
                        className="hover:bg-black/10 p-2 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                        onClick={() => values.id && handleDelete(values.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        ) : (
                          <RiDeleteBin7Line />
                        )}
                      </button>
                    )}
                  </div>
                </Form>
              </div>
            )}
          </Formik>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
