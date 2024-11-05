import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Loading from "../../components/loading";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useState, useEffect, useRef, useCallback } from "react";
import InputField from "../../components/formFields/inputField";
import MultiSelectField from "../../components/formFields/multiSelectField";
import ArtistMultiSelectField from "../../components/formFields/artistsMultiSelectField";
import { Formik, Form, FieldArray, Field } from "formik";
import { Cross } from "../../icons/cross";
import {
  deleteCalendarShow,
  createCalendarShow,
  updateCalendarShow,
  createArtist,
} from "../../lib/contentful/calendar";
import { Arrow } from "../../icons/arrow";
import CheckboxField from "../../components/formFields/checkboxField";
import { Close } from "../../icons/menu";
import { TfiReload } from "react-icons/tfi";
import { RxLink1 } from "react-icons/rx";
import { IoMdCheckmark, IoMdMusicalNote } from "react-icons/io";
import {
  RxExternalLink,
  RxDownload,
  RxCopy,
  RxDotsVertical,
} from "react-icons/rx";
import { AiOutlineLoading3Quarters, AiOutlineCalendar } from "react-icons/ai";
import { RiDeleteBin7Line } from "react-icons/ri";
import Link from "next/link";
import dayjs from "dayjs";
import useWindowSize from "../../hooks/useWindowSize";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import CalendarSearch from "../../views/admin/calendarSearch";
import CalendarInsta from "../../views/admin/calendarInsta";
import EmailModal from "../../views/admin/emailModal";
import TextareaField from "../../components/formFields/textareaField";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { createClient } from "contentful-management";
import AdditionalMenu from "../../views/admin/additionalMenu";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}`
  : "http://localhost:3000/";

export default function CalendarPage() {
  return (
    <Layout>
      <div className="calendar-container">
        <Calendar />
      </div>
    </Layout>
  );
}

function Calendar() {
  const [showDialogOpen, setShowDialogOpen] = useState<boolean>(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [highlightedShow, setHighlightedShow] = useState<string>(null);
  const calendarRef = useRef<any>();
  const formRef = useRef<any>();
  const datePicker = useRef<any>();
  const windowSize = useWindowSize();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [contentfulClient, setContentfulClient] = useState<any>(null);

  useEffect(() => {
    const contentfulClient = async () => {
      const { data } = await supabaseClient
        .from("accessTokens")
        .select("token")
        .eq("application", "contentful")
        .limit(1)
        .single();
      const client = createClient({
        accessToken: data.token,
      });
      setContentfulClient(client);
    };
    if (user) contentfulClient();
  }, [user]);

  const handleKeyPress = useCallback((event) => {
    const calendarApi = calendarRef.current.getApi();

    if (event.key == "ArrowLeft") {
      calendarApi.prev();
    } else if (event.key == "ArrowRight") {
      calendarApi.next();
    } else if (event.key == "w") {
      calendarApi.changeView("timeGridWeek");
    } else if (event.key == "d") {
      calendarApi.changeView("timeGridDay");
    } else if (event.key == "a") {
      calendarApi.changeView("listMonth");
    } else if (event.key == "r") {
      reloadCalendar();
    }
  }, []);

  useEffect(() => {
    if (formRef.current) {
      console.log(formRef);
    }
  }, [formRef]);

  useEffect(() => {
    if (!showDialogOpen && !searchDialogOpen) {
      // attach the event listener
      document.addEventListener("keydown", handleKeyPress);

      // remove the event listener
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [handleKeyPress, showDialogOpen, searchDialogOpen]);

  const statusOptions = [
    {
      value: "TBC",
      label: "TBC",
    },
    {
      value: "Confirmed",
      label: "Confirmed",
    },
    {
      value: "Submitted",
      label: "Submitted",
    },
  ];

  const channelOptions = [
    {
      value: "1",
      label: "1",
    },
    {
      value: "2",
      label: "2",
    },
  ];

  // useEffect(() => {
  // const interval = setInterval(() => reloadCalendar(), 30000);
  // return () => {
  //   clearInterval(interval);
  // };
  // }, []);

  const initialValues = {
    id: selectedShow?.id,
    title: selectedShow?.title,
    type: selectedShow?.extendedProps?.type
      ? selectedShow?.extendedProps?.type
      : "Live",
    start: selectedShow?.startStr,
    end: selectedShow?.endStr,
    artists: selectedShow?.extendedProps?.artists
      ? selectedShow?.extendedProps?.artists
      : [],
    status: {
      value: selectedShow?.extendedProps?.status
        ? selectedShow?.extendedProps?.status
        : "TBC",
      label: selectedShow?.extendedProps?.status
        ? selectedShow?.extendedProps?.status
        : "TBC",
    },
    channel: {
      value: selectedShow?.extendedProps?.channel
        ? selectedShow?.extendedProps?.channel
        : "1",
      label: selectedShow?.extendedProps?.channel
        ? selectedShow?.extendedProps?.channel
        : "1",
    },
    hasExtraArtists: false,
    extraArtists: [
      {
        name: "",
        pronouns: "",
      },
    ],
    artistEmails: [{}],
    isFeatured: selectedShow?.extendedProps?.isFeatured
      ? selectedShow?.extendedProps?.isFeatured
      : false,
  };

  const handleSubmit = async (values, actions) => {
    const method = values.id ? "update" : "create";
    let show = null;
    setCalendarLoading(true);
    try {
      if (values.hasExtraArtists) {
        for (const artist of values.extraArtists) {
          // if ((artist.bio && artist.image) || (artist.bio !== "" && artist.image !== "")) {
          console.log("adding artist to contentful: " + artist.name);
          const contentfulNewArtist = await createArtist(
            artist,
            contentfulClient
          );
          console.log(contentfulNewArtist);
          values.artists.push(contentfulNewArtist);
          // }
        }
      }

      // if (values.artistEmails) {
      //   console.log(values.artistEmails);
      //   for (const artist of values.artistEmails) {
      //     await updateArtistEmail(artist.id, artist.email);
      //   }
      // }

      if (method == "update") {
        show = await updateCalendarShow(values, contentfulClient);
      } else {
        show = await createCalendarShow(values, contentfulClient);
      }

      // manually add show to full calendar
      const calendarApi = calendarRef.current.getApi();
      console.log(values);
      const fcEvent = transformEventForFullCalendar(values, show.entry.sys.id);
      if (method == "update") {
        calendarApi.getEventById(values.id).remove();
      }
      calendarApi.addEvent(fcEvent, []);
      actions.setSubmitting(false);
      actions.setStatus("submitted");
      setCalendarLoading(false);
      setShowDialogOpen(false);
      toast.success(method == "update" ? "Show updated" : "Show created");
      if (show.confirmationEmail) {
        const fetchPromise = fetch("/api/admin/confirmation-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }).then((response) => {
          return response.ok
            ? response.json()
            : Promise.reject(response.json());
        });

        toast.promise(fetchPromise, {
          loading: "Sending confirmation email",
          success: "Confirmation email sent",
          error: "Failed to send confirmation email",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        method == "create" ? "Error updating show" : "Error creating show"
      );
      setCalendarLoading(false);
      actions.setSubmitting(false);
      throw error;
    }
  };

  const handleEventDrop = async (eventInfo) => {
    setCalendarLoading(true);
    console.log("handle drop: " + eventInfo);
    const values = {
      id: eventInfo.event.id,
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
    };
    updateCalendarShow(values, contentfulClient)
      .then(() => {
        setCalendarLoading(false);
        toast.success("Show updated");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error moving show");
      });
  };

  const handleDelete = async (id) => {
    setCalendarLoading(true);
    setIsDeleting(true);
    deleteCalendarShow(id, contentfulClient)
      .then((entry) => {
        let calendarApi = calendarRef.current.getApi();
        calendarApi.getEventById(id).remove();
        setShowDialogOpen(false);
        setCalendarLoading(false);
        setIsDeleting(false);
        toast.success("Show deleted");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Error deleting show");
      });
  };

  const transformEventForFullCalendar = (values, id) => {
    return {
      id: id,
      title: values.title ? values.title : "",
      type: values.type ? values.type : "Live",
      artists: values.artists,
      start: values.start,
      end: values.end,
      status: values.status.value,
      published: false,
      isFeatured: values.isFeatured,
      backgroundColor:
        values.status.value == "TBC"
          ? "#e3e3e3"
          : values.status.value == "Confirmed"
          ? "#F1E2AF"
          : values.status.value == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      borderColor:
        values.status.value == "TBC"
          ? "#e3e3e3"
          : values.status.value == "Confirmed"
          ? "#F1E2AF"
          : values.status.value == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
    };
  };

  const handleSelect = (selectInfo) => {
    setShowDialogOpen(true);
    setSelectedShow(selectInfo);
    console.log(selectInfo.startStr);
  };

  const handleEventClick = (eventInfo) => {
    setShowDialogOpen(true);
    setSelectedShow(eventInfo.event);
  };

  const reloadCalendar = () => {
    console.log("reloading calendar");
    let calendarApi = calendarRef.current.getApi();
    calendarApi.refetchEvents();
  };

  const openDatePicker = () => {
    datePicker.current.showPicker();
  };

  const handleDatePickerChange = () => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(datePicker.current.value);
  };

  const handleDatesSet = (dateInfo) => {
    router.replace(
      {
        query: {
          start: dateInfo.startStr.split("T")[0],
          view: dateInfo.view.type,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const goToHighlightedShow = (date, showId) => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);
    // calendarApi.scrollToTime(date);
    setHighlightedShow(showId);
    // to do: check if date of select show is outside of current daterange of calendar
    setTimeout(() => {
      if (!calendarLoading) {
        highlightShow(showId);
      }
    }, 300);
  };

  const handleCalendarLoading = (e) => {
    setCalendarLoading(e);
    if (!e && highlightedShow) {
      highlightShow(highlightedShow);
    }
  };

  const highlightShow = (showId) => {
    setTimeout(() => {
      const showEl = document.getElementById(showId).parentElement;
      // to do: scroll event into view
      showEl.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      console.log(showEl);
      showEl.classList.add("fc-highlighted-event");
      setHighlightedShow(null);
      setTimeout(() => {
        if (showEl) {
          showEl.classList.remove("fc-highlighted-event");
        }
      }, 10000);
    }, 100);
  };

  const handleSearchDialogToggle = (open) => {
    setSearchDialogOpen(open);
  };

  const handleCopyFormLink = (showId) => {
    const showFormLink = baseUrl + "submission-v2?id=" + showId;
    navigator.clipboard.writeText(showFormLink).then(
      () => {
        toast.success("Submission link copied to clipboard");
      },
      () => {
        toast.error("Issue copying to clipboard");
      }
    );
  };

  const getInitialView = () => {
    if (windowSize.width < 765) {
      return "timeGridDay";
    } else {
      if (router.query?.view) {
        return router.query.view.toString();
      } else return "timeGridWeek";
    }
  };

  async function downloadImages() {
    console.log(selectedShow.extendedProps.images);
    if (selectedShow.extendedProps.images[0]) {
      for (
        let index = 0;
        index < selectedShow.extendedProps.images.length;
        index++
      ) {
        // for each image of the show
        // define what we want in the ZIP
        const url = selectedShow.extendedProps.images[index].replace(
          "http://",
          "https://"
        );
        // get the ZIP stream in a Blob
        let blob = await fetch(url).then((r) => r.blob());

        // make and click a temporary link to download the Blob
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = selectedShow.title + " (" + (index + 1) + ")";
        link.click();
        link.remove();
      }
    } else {
      toast.error("Show has no images");
    }
  }

  if (windowSize.width && router.isReady && contentfulClient)
    return (
      <div className="mt-2 lg:m-4 h-[calc(100vh-100px)] lg:h-[calc(100vh-125px)] relative">
        <PageMeta title="Calendar | Refuge Worldwide" path="signin/" />
        <div>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                border: "1px solid black",
                padding: "16px",
                color: "black",
                borderRadius: "0px",
                fontSize: "1.5rem",
              },
            }}
          />
        </div>
        <FullCalendar
          ref={calendarRef}
          initialDate={router.query?.start?.toString()}
          plugins={[
            dayGridPlugin,
            interactionPlugin,
            timeGridPlugin,
            listPlugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay,listMonth",
          }}
          customButtons={{
            addShow: {
              text: "+ Show",
              hint: "Add show",
              click: () => {
                setShowDialogOpen(true);
              },
            },
          }}
          expandRows={true}
          height={"100%"}
          allDaySlot={false}
          scrollTime={"10:00:00"}
          eventColor="#a1cfad"
          eventTextColor="#000"
          timeZone="Europe/Berlin"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
          }}
          nextDayThreshold="09:00:00"
          slotDuration="00:30:00"
          slotMaxTime="26:00:00"
          slotMinTime="08:00:00"
          dayHeaderContent={(args) => {
            return dayjs(args.date).format("ddd DD/MM");
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
          }}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          select={handleSelect}
          editable={true}
          selectable={true}
          loading={(e) => handleCalendarLoading(e)}
          firstDay={1}
          initialView={getInitialView()}
          nowIndicator={true}
          selectMirror={true}
          datesSet={handleDatesSet}
          events={getEvents}
          eventContent={renderEventContent}
          scrollTimeReset={false}
        />

        <input
          type="date"
          className="absolute top-0 lg:top-12 right-12 lg:left-0 p-0 h-9 w-32 lg:h-0 lg:w-0 z-10 bg-transparent border-black border-2 lg:border-0 rounded-full"
          ref={datePicker}
          onChange={handleDatePickerChange}
        ></input>
        <button
          className="hidden lg:block absolute top-1 left-2 lg:left-0"
          onClick={openDatePicker}
        >
          <AiOutlineCalendar size={25} />
        </button>
        <div className="flex items-center gap-2 absolute top-1.5 right-2 lg:right-0">
          <CalendarSearch
            onView={goToHighlightedShow}
            onEdit={handleEventClick}
            onToggle={handleSearchDialogToggle}
          />
          <button
            className="disabled:cursor-wait"
            onClick={reloadCalendar}
            disabled={calendarLoading}
          >
            {calendarLoading ? (
              <AiOutlineLoading3Quarters size={20} className="animate-spin" />
            ) : (
              <TfiReload size={20} />
            )}
          </button>
          <AdditionalMenu />
        </div>
        {/* <DropdownMenu.Root
          open={addDropdownOpen}
          onOpenChange={setAddDropdownOpen}
        >
          <DropdownMenu.Trigger asChild>
            <button className="absolute bottom-2 right-2 p-4 z-40 border-black border-2 rounded-full bg-white shadow-lg">
              <Cross className="rotate-45" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[220px] bg-white  p-[5px] shadow-2xl z-50 border-black border"
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                onSelect={() => {
                  setSelectedShow(null);
                  setShowDialogOpen(true);
                  setAddDropdownOpen(false);
                }}
                className="group text-small leading-none text-violet11 flex items-center h-[25px] px-[5px] relative pl-[25px] select-none hover:bg-grey outline-none cursor-pointer"
              >
                New Show
              </DropdownMenu.Item>
              <DropdownMenu.Item className="group text-small leading-none text-violet11 flex items-center h-[25px] px-[5px] relative pl-[25px] select-none cursor-not-allowed hover:bg-grey outline-none">
                Download images
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root> */}

        <Dialog.Root
          open={showDialogOpen}
          onOpenChange={(showDialogOpen) => setShowDialogOpen(showDialogOpen)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="data-[state=open]:animate-overlayShow  w-screen h-screen fixed top-0 left-0 bg-black/50 z-50 backdrop-blur-sm" />
            <Dialog.Content className="data-[state=open]:animate-contentShow bg-white w-full h-full lg:h-auto lg:max-w-4xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
              <Formik
                innerRef={formRef}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                form="showForm"
              >
                {({ values, isSubmitting, dirty, setFieldValue }) => (
                  <div className="relative overflow-y-auto max-h-[95vh]">
                    <div className="px-8 py-4 sticky top-0 bg-white border-b border-black flex justify-between gap-4 items-center z-20">
                      <Dialog.Title asChild className="grow">
                        <h5 className="font-sans font-medium">
                          {selectedShow?.title ? "Edit" : "New"} show
                        </h5>
                      </Dialog.Title>
                      {values?.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadImages()}
                            className="hover:bg-black/10 p-2 rounded-lg"
                          >
                            <RxDownload />
                          </button>

                          <button
                            type="button"
                            className="hover:bg-black/10 p-2 rounded-lg hidden lg:block"
                            onClick={() => {
                              setFieldValue("id", undefined);
                              toast.success(
                                "Show duplicated. Please change necessary fields and hit the add button."
                              );
                            }}
                          >
                            <RxCopy />
                          </button>
                          <button
                            onClick={() => handleCopyFormLink(values.id)}
                            className="hover:bg-black/10 px-2 py-1 rounded-lg"
                          >
                            <RxLink1 />
                          </button>
                          <Link
                            className="hover:bg-black/10 px-2 py-1 rounded-lg"
                            target="_blank"
                            href={`https://app.contentful.com/spaces/taoiy3h84mql/environments/master/entries/${selectedShow.id}`}
                          >
                            <RxExternalLink />
                          </Link>
                        </div>
                      )}
                      <Dialog.Close asChild>
                        <button aria-label="Close" className="lg:hidden">
                          <Cross />
                        </button>
                      </Dialog.Close>
                    </div>
                    <Form id="calendarShow">
                      {/* <pre className="text-white bg-black">
                        {JSON.stringify(values, null, 2)}
                      </pre> */}
                      <div className="p-8">
                        <Field type="hidden" name="id" />
                        <div className="mb-8 flex items-center gap-6">
                          <RadioGroup.Root
                            className="flex flex-1"
                            name="Type of show"
                            onValueChange={(value: string) =>
                              setFieldValue("type", value)
                            }
                            defaultValue="live"
                            value={values.type}
                          >
                            <RadioGroup.Item value="Live" asChild>
                              <label className="data-[state=checked]:bg-blue  block cursor-pointer pill-input rounded-tr-none rounded-br-none py-3 text-center">
                                Live
                              </label>
                            </RadioGroup.Item>

                            <RadioGroup.Item value="Pre-record" asChild>
                              <label className="data-[state=checked]:bg-blue block cursor-pointer select-none pill-input rounded-tl-none rounded-bl-none py-3 text-center">
                                Pre-record
                              </label>
                            </RadioGroup.Item>
                          </RadioGroup.Root>
                          <CheckboxField
                            name="isFeatured"
                            label="🍊"
                            className="!mb-0"
                          />
                        </div>
                        <div>
                          <div className="flex-1">
                            <InputField
                              name="title"
                              label="Show name"
                              type="text"
                            />
                          </div>
                        </div>

                        <ArtistMultiSelectField
                          label="Artist(s)"
                          name="artists"
                          limit={10}
                          value={initialValues.artists}
                          includeEmail={true}
                          showStatus={true}
                        />
                        <EmailModal
                          artists={values.artists}
                          client={contentfulClient}
                        />

                        {/* <details className="-mt-6 mb-8" open={!values.id}>
                          <summary className="text-small">Emails</summary>
                          <FieldArray
                            name="artistEmails"
                            render={() => (
                              <div>
                                {values.artists.map((artist, index) => (
                                  <div key={"artistEmails" + index}>
                                    <input
                                      name={`artistEmails.${index}.id`}
                                      type="text"
                                      value={artist.value}
                                    />
                                    <InputField
                                      name={`artistEmails.${index}.id`}
                                      type="text"
                                      label={`Email for ${artist.label}`}
                                      required
                                      value={artist.value}
                                      hidden
                                    />
                                    <Field
                                      type="text"
                                      name={`artistEmails.${index}.id`}
                                      value={artist.value}
                                      hidden
                                    />
                                    <InputField
                                      name={`artistEmails.${index}.email`}
                                      type="text"
                                      label={`Email for ${artist.label}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </details> */}
                        <CheckboxField
                          name="hasExtraArtists"
                          label="New artist?"
                          size="small"
                        />

                        {values.hasExtraArtists && (
                          <fieldset className=" mb-8">
                            <legend className="mb-6">New artist(s)</legend>
                            <FieldArray
                              name="extraArtists"
                              render={(arrayHelpers) => (
                                <div>
                                  {values.extraArtists &&
                                    values.extraArtists.map(
                                      (extraArtist, index) => (
                                        <div
                                          className="mb-8 border border-black p-8 relative"
                                          key={"extraArtist" + index}
                                        >
                                          {index > 0 && (
                                            <button
                                              className="float-right"
                                              onClick={() =>
                                                arrayHelpers.remove(index)
                                              }
                                              type="button"
                                            >
                                              <Close size={24} />
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
                                            type="text"
                                            label="Email"
                                            required
                                          />
                                        </div>
                                      )
                                    )}
                                  <button
                                    className="underline"
                                    onClick={() => arrayHelpers.push("")}
                                    type="button"
                                  >
                                    Add another artist
                                  </button>
                                </div>
                              )}
                            />
                          </fieldset>
                        )}

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
                        <MultiSelectField
                          label="Status"
                          name="status"
                          options={statusOptions}
                          limit={1}
                          value={[initialValues.status]}
                        />
                        <MultiSelectField
                          label="Channel"
                          name="channel"
                          options={channelOptions}
                          limit={1}
                          value={[initialValues.channel]}
                        />
                      </div>
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
                          <div className="flex gap-6 items-center">
                            <button
                              type="button"
                              className="hover:bg-black/10 p-2 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                              value="delete"
                              onClick={() => {
                                handleDelete(values.id);
                              }}
                              disabled={isDeleting}
                            >
                              {" "}
                              {isDeleting ? (
                                <AiOutlineLoading3Quarters className="animate-spin" />
                              ) : (
                                <RiDeleteBin7Line />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </Form>
                  </div>
                )}
              </Formik>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );

  return <Loading />;
}

function renderEventContent(eventInfo) {
  return (
    <div className="p-1" id={eventInfo.event.id}>
      <div className="mt-1 flex justify-between gap-2">
        <p className="text-xxs font-medium grow">{eventInfo.timeText} </p>
        {eventInfo.event.extendedProps.type == "Pre-record" && (
          <p className="text-xxs border border-black/20 opacity-80 bg-black text-white px-1 rounded">
            Pre-rec
          </p>
        )}
        {eventInfo.event.extendedProps.channel == "2" && (
          <p className="text-xxs h-fit border border-black/20 opacity-80 bg-black text-white px-1 rounded">
            CH2
          </p>
        )}
      </div>
      <p className="text-tiny mt-1 line-clamp-2 slot-title">
        {eventInfo.event.title}
      </p>
      <p className="text-xxs mt-1">
        {eventInfo.event.extendedProps.artists &&
          eventInfo.event.extendedProps.artists.map((artist, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {artist.label}
            </span>
          ))}
      </p>
      <div className="absolute bottom-1 right-1 opacity-50 flex">
        {eventInfo.event?.extendedProps?.mixcloudLink && <IoMdMusicalNote />}
        {eventInfo.event?.extendedProps?.published && <IoMdCheckmark />}
      </div>
    </div>
  );
}

async function getEvents(info: any) {
  const response = await fetch(
    `/api/admin/calendar?start=${info.startStr}&end=${info.endStr}`
  );
  const shows = await response.json();
  return shows.processed;
}
