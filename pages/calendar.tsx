import Layout from "../components/layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Loading from "../components/loading";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useRef } from "react";
import InputField from "../components/formFields/inputField";
import MultiSelectField from "../components/formFields/multiSelectField";
import { Formik, Form, FieldArray } from "formik";
import { Cross } from "../icons/cross";
import { getAllArtists } from "../lib/contentful/pages/submission";
import { Arrow } from "../icons/arrow";
import CheckboxField from "../components/formFields/checkboxField";
import { Close } from "../icons/menu";
import { TfiReload } from "react-icons/tfi";
import { IoMdCheckmark } from "react-icons/io";
import { RxExternalLink } from "react-icons/rx";
import Link from "next/link";

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
  const [artists, setArtists] = useState(null);
  const [showDialogOpen, setShowDialogOpen] = useState<boolean>(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const calendarRef = useRef<any>();

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

  useEffect(() => {
    (async () => {
      const artists = await getAllArtists();
      setArtists(artists);
    })();
  }, []);

  function handleSelect(selectInfo) {
    console.log("select info");
    setShowDialogOpen(true);
    setSelectedShow(selectInfo);
    console.log(selectInfo.startStr);
  }

  function handleEventClick(eventInfo) {
    // remove UTC timezone stamp
    setShowDialogOpen(true);
    setSelectedShow(eventInfo.event);
  }

  const initialValues = {
    showName: selectedShow?.title,
    booker: "George",
    start: selectedShow?.startStr,
    end: selectedShow?.endStr,
    artists: selectedShow?.extendedProps?.artists,
    status: selectedShow?.extendedProps?.status,
    hasExtraArtists: false,
    extraArtists: [
      {
        name: "",
        pronouns: "",
      },
    ],
  };

  const _handleSubmit = (values, actions) => {
    console.log("submit form");
  };

  const reloadCalendar = () => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.refetchEvents();
  };

  return (
    <div className="m-8 h-[calc(100vh-150px)] relative">
      {/* <pre className="text-white bg-black">
        {JSON.stringify(shows, null, 2)}
      </pre> */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,dayGridDay,listWeek addShow",
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
        height={"100%"}
        hiddenDays={[0]}
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
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
          hour12: false,
        }}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventAdd={handleEventAdd}
        select={handleSelect}
        loading={(e) => setCalendarLoading(e)}
        firstDay={1}
        initialView="timeGridWeek"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={getEvents}
        eventContent={renderEventContent}
      />
      <button className="absolute top-2.5 right-0" onClick={reloadCalendar}>
        <TfiReload
          className={`animate-refresh animate-pulse ${
            calendarLoading ? "" : "pause"
          }
          }`}
        />
      </button>

      <Dialog.Root
        open={showDialogOpen}
        onOpenChange={(showDialogOpen) => setShowDialogOpen(showDialogOpen)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen fixed top-0 left-0 bg-black opacity-70 z-50" />
          <Dialog.Content className="bg-white max-w-2xl fixed  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
            <div className="relative p-8 overflow-y-scroll max-h-[95vh]">
              <Dialog.Close asChild>
                <button className="float-right" aria-label="Close">
                  <Cross />
                </button>
              </Dialog.Close>
              <Dialog.Title asChild className="mb-6">
                <h5 className="font-sans font-medium">
                  {selectedShow?.title ? "Edit" : "New"} show
                  {selectedShow?.extendedProps?.contentfulId && (
                    <Link
                      href={`https://app.contentful.com/spaces/taoiy3h84mql/environments/master/entries/${selectedShow.extendedProps.contentfulId}`}
                    >
                      <RxExternalLink className="inline ml-2 mb-1" />
                    </Link>
                  )}
                </h5>
              </Dialog.Title>
              {/* <Dialog.Description className=""></Dialog.Description> */}
              {/* <pre className="text-white bg-black h-96 overflow-scroll">
              {JSON.stringify(selectedShow, null, 2)}
            </pre> */}
              <Formik initialValues={initialValues} onSubmit={_handleSubmit}>
                {({ values, isSubmitting }) => (
                  <Form id="calendarShow">
                    <InputField
                      name="showName"
                      label="Show name"
                      required
                      type="text"
                    />
                    <MultiSelectField
                      label="Artist(s)*"
                      name="artists"
                      options={artists}
                      limit={10}
                      value={initialValues.artists}
                    />
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
                    <MultiSelectField
                      label="Status"
                      name="status"
                      options={statusOptions}
                      limit={10}
                      value={initialValues.status}
                    />
                    <InputField
                      name="booker"
                      label="Booker"
                      required
                      type="text"
                    />

                    <button className="font-medium underline flex gap-3 items-center">
                      {" "}
                      {selectedShow?.title ? "Edit" : "Add"} show
                      <Arrow />
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function renderEventContent(eventInfo) {
  console.log(eventInfo);
  return (
    <div className="p-1">
      <div className="mt-1 flex justify-between">
        <p className="text-xxs font-medium">{eventInfo.timeText} </p>
        <p className="text-xxs italic">George </p>
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
      {eventInfo.event?.extendedProps?.published && (
        <IoMdCheckmark className="inline mb-0.5 ml-1 opacity-30 absolute bottom-1 right-1" />
      )}
    </div>
  );
}

function handleDateClick(eventInfo) {
  console.log("date clicked");
  console.log(eventInfo);
}

function handleEventAdd(eventInfo) {
  console.log("event added");
  console.log(eventInfo);
}

async function getEvents(info: any) {
  const response = await fetch(
    `/api/calendar?start=${info.startStr}&end=${info.endStr}`
  );
  const shows = await response.json();
  return shows.processed;
}
