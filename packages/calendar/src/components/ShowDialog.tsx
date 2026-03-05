import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Formik, Form, Field, FieldArray } from "formik";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxDownload, RxCopy, RxLink1, RxExternalLink } from "react-icons/rx";
import { RiDeleteBin7Line } from "react-icons/ri";
import toast from "react-hot-toast";
import type { RRule } from "rrule";
import {
  RepeatSection,
  toRRuleString,
  generateOccurrences,
} from "./RepeatSection";

import type { CalendarConfig, ShowNotificationData } from "../config";
import { getParticipantTypes } from "../config";
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
    method: "create" | "update",
    keepOpen?: boolean
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
  const [repeatRule, setRepeatRule] = React.useState<RRule | null>(null);
  const [repeatDisplayText, setRepeatDisplayText] = React.useState<
    string | undefined
  >(undefined);
  const [repeatProgress, setRepeatProgress] = React.useState<{
    current: number;
    total: number;
    rollingBack?: boolean;
  } | null>(null);
  // Ref so the onOpenChange guard works during both creation and rollback
  const isCreatingRepeats = React.useRef(false);

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

  const participantTypes = getParticipantTypes(config);
  const isMultiType = participantTypes.length > 1;

  // Build per-type participant map from the flat tagged artists array
  const allParticipants: DropdownOption[] =
    selectedShow?.extendedProps?.artists ?? [];
  const initialParticipants: Record<string, DropdownOption[]> = {};
  for (const pt of participantTypes) {
    initialParticipants[pt.showField] = isMultiType
      ? allParticipants.filter((a) => a.sourceField === pt.showField)
      : allParticipants;
  }

  const initialValues: ShowFormValues & {
    hasExtraArtists: boolean;
    extraArtists: Array<{ name: string; pronouns?: string; email?: string }>;
  } = {
    id: selectedShow?.id,
    title: selectedShow?.title,
    type: selectedShow?.extendedProps?.type ?? config.typeValues.live,
    start: selectedShow?.startStr ?? "",
    end: selectedShow?.endStr ?? "",
    // Legacy single-type field — kept for backwards compat
    artists: initialParticipants[config.fields.show.artists] ?? allParticipants,
    // Multi-type map
    participants: isMultiType ? initialParticipants : undefined,
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

      if (method === "create" && repeatRule) {
        // Bulk create: fire all requests in parallel, rollback everything on any failure
        const occurrences = generateOccurrences(
          repeatRule,
          values.start,
          values.end
        );
        const rruleString = toRRuleString(repeatRule);
        setRepeatProgress({ current: 0, total: occurrences.length });
        isCreatingRepeats.current = true;

        const onBeforeUnload = (e: BeforeUnloadEvent) => {
          e.preventDefault();
        };
        window.addEventListener("beforeunload", onBeforeUnload);

        try {
          let completed = 0;
          const results = await Promise.allSettled(
            occurrences.map(async (occ) => {
              const show = await createCalendarShow(
                {
                  ...(values as ShowFormValues),
                  start: occ.start,
                  end: occ.end,
                },
                client,
                config,
                rruleString
              );
              completed++;
              setRepeatProgress({
                current: completed,
                total: occurrences.length,
              });
              return { show, occ };
            })
          );

          type CreatedResult = {
            show: MutationResult;
            occ: { start: string; end: string };
          };
          const succeeded = results.filter(
            (r): r is PromiseFulfilledResult<CreatedResult> =>
              r.status === "fulfilled"
          );
          const failedCount = results.length - succeeded.length;

          if (failedCount > 0) {
            // Rollback: delete all successfully created entries from Contentful
            setRepeatProgress({
              current: 0,
              total: succeeded.length,
              rollingBack: true,
            });
            let rolledBack = 0;
            await Promise.allSettled(
              succeeded.map(async (r) => {
                await deleteCalendarShow(
                  r.value.show.entry.sys.id,
                  client,
                  config
                );
                rolledBack++;
                setRepeatProgress({
                  current: rolledBack,
                  total: succeeded.length,
                  rollingBack: true,
                });
              })
            );
            toast.error(
              `${failedCount} show${
                failedCount > 1 ? "s" : ""
              } failed — nothing was saved. Please try again.`
            );
            // Dialog stays open so the user can retry
          } else {
            // All succeeded — send one confirmation email for the first occurrence
            const firstResult = succeeded[0];
            if (
              firstResult.value.show.confirmationEmail &&
              config.onShowConfirmed
            ) {
              const showData: ShowNotificationData = {
                id: firstResult.value.show.entry.sys.id,
                title: values.title ?? "",
                date: firstResult.value.occ.start,
                dateEnd: firstResult.value.occ.end,
                participants: (values.artists ?? []).map((a) => ({
                  name: a.label,
                  email: a.email ?? [],
                })),
                rruleText: repeatDisplayText,
              };
              toast.promise(config.onShowConfirmed(showData), {
                loading: "Sending confirmation email…",
                success: "Confirmation email sent",
                error: "Failed to send confirmation email",
              });
            }

            for (const result of succeeded) {
              onShowSaved(
                result.value.show,
                {
                  ...(values as ShowFormValues),
                  start: result.value.occ.start,
                  end: result.value.occ.end,
                },
                "create",
                true
              );
            }
            toast.success(
              `Created ${succeeded.length} show${
                succeeded.length !== 1 ? "s" : ""
              }`
            );
            onOpenChange(false);
          }
        } finally {
          window.removeEventListener("beforeunload", onBeforeUnload);
          setRepeatProgress(null);
          isCreatingRepeats.current = false;
        }
      } else {
        const show =
          method === "update"
            ? await updateCalendarShow(
                values as ShowFormValues & { id: string },
                client,
                config
              )
            : await createCalendarShow(
                values as ShowFormValues,
                client,
                config
              );

        onShowSaved(show, values as ShowFormValues, method);
      }

      actions.setSubmitting(false);
      actions.setStatus("submitted");
    } catch (error) {
      toast.error(
        method === "update" ? "Error updating show" : "Error creating show"
      );
      setRepeatProgress(null);
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
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        // Prevent closing while repeat shows are being created or rolled back
        if (!next && isCreatingRepeats.current) return;
        onOpenChange(next);
      }}
    >
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

                    {/* Participant fields — one per configured type */}
                    {isMultiType ? (
                      participantTypes.map((pt) => (
                        <ArtistMultiSelectField
                          key={pt.showField}
                          label={pt.label}
                          name={`participants.${pt.showField}`}
                          limit={10}
                          value={
                            initialValues.participants?.[pt.showField] ?? []
                          }
                          searchEndpoint={`${searchEndpoint}?type=${pt.contentTypeId}`}
                        />
                      ))
                    ) : (
                      <ArtistMultiSelectField
                        label="Artist(s)"
                        name="artists"
                        limit={10}
                        value={initialValues.artists}
                        searchEndpoint={searchEndpoint}
                      />
                    )}

                    {/* Participant emails */}
                    <EmailModal
                      artists={
                        isMultiType
                          ? participantTypes.flatMap(
                              (pt) => values.participants?.[pt.showField] ?? []
                            )
                          : values.artists
                      }
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
                    <fieldset className="mb-8">
                      <legend>Status</legend>
                      <select
                        value={values.status.value}
                        onChange={(e) =>
                          setFieldValue("status", {
                            value: e.target.value,
                            label: e.target.value,
                          })
                        }
                        className="pill-input"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </fieldset>

                    {/* Repeat — new shows only */}
                    {!values.id && values.start && (
                      <RepeatSection
                        startDate={values.start}
                        onChange={(rule, text) => {
                          setRepeatRule(rule);
                          setRepeatDisplayText(text);
                        }}
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center lg:sticky lg:bottom-0 lg:bg-white py-4 px-8 border-t border-black">
                    <button
                      type="submit"
                      className="hover:bg-black/10 py-2 px-4 rounded-lg inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      <span className="underline">
                        {values?.id
                          ? "Save"
                          : repeatRule
                          ? `Add ${
                              repeatRule.all((_, i) => i < 52).length
                            } shows`
                          : "Add"}
                      </span>
                      {isSubmitting ? (
                        repeatProgress ? (
                          <span className="text-sm tabular-nums">
                            {repeatProgress.rollingBack ? "Rolling back " : ""}
                            {repeatProgress.current}/{repeatProgress.total}
                          </span>
                        ) : (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        )
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
