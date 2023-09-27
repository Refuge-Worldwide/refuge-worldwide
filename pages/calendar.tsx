import Layout from "../components/layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Loading from "../components/loading";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState, useEffect, useRef, useCallback } from "react";
import InputField from "../components/formFields/inputField";
import MultiSelectField from "../components/formFields/multiSelectField";
import { Formik, Form, FieldArray, Field, useFormikContext } from "formik";
import { Cross } from "../icons/cross";
import { getAllArtists } from "../lib/contentful/pages/submission";
import { Arrow } from "../icons/arrow";
import CheckboxField from "../components/formFields/checkboxField";
import { Close } from "../icons/menu";
import { TfiReload } from "react-icons/tfi";
import { IoMdCheckmark, IoMdMusicalNote } from "react-icons/io";
import { RxExternalLink } from "react-icons/rx";
import { AiOutlineLoading3Quarters, AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin7Line } from "react-icons/ri";
import Link from "next/link";
import dayjs from "dayjs";

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
  const [addDropdownOpen, setAddDropdownOpen] = useState<boolean>(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [calendarLoadingIcon, setCalendarLoadingIcon] =
    useState<boolean>(false);
  const calendarRef = useRef<any>();
  const formRef = useRef<any>();

  useEffect(() => {
    if (formRef.current) {
      console.log(formRef);
    }
  }, [formRef]);

  useEffect(() => {
    (async () => {
      if (!calendarLoading) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCalendarLoadingIcon(calendarLoading);
    })();
  }, [calendarLoading]);

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
    const interval = setInterval(() => reloadCalendar(), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const initialValues = {
    id: selectedShow?.id,
    title: selectedShow?.title,
    start: selectedShow?.startStr,
    end: selectedShow?.endStr,
    artists: selectedShow?.extendedProps?.artists
      ? selectedShow?.extendedProps?.artists
      : [],
    status: [
      {
        value: selectedShow?.extendedProps?.status
          ? selectedShow?.extendedProps?.status
          : "TBC",
        label: selectedShow?.extendedProps?.status
          ? selectedShow?.extendedProps?.status
          : "TBC",
      },
    ],
    booker: selectedShow?.extendedProps?.booker,
    hasExtraArtists: false,
    extraArtists: [
      {
        name: "",
        pronouns: "",
      },
    ],
  };

  const _handleSubmit = async (values, actions) => {
    setCalendarLoading(true);
    console.log("submitting the form");
    console.log(values);
    const JSONData = JSON.stringify(values);
    const endpoint = "/api/calendar";
    const options = {
      // The method is POST because we are sending data.
      method: values.id ? "PATCH" : "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONData,
    };
    const response = await fetch(endpoint, options);
    if (response.status === 400) {
      // Validation error
      actions.setSubmitting(false);
    } else if (response.ok) {
      // successful
      console.log("show added successfully");

      // add id to values
      const body = await response.json();
      console.log(body);
      // manually add show from full calendar
      let calendarApi = calendarRef.current.getApi();
      calendarApi.addEvent(transformEventForFullCalendar(values, body));

      actions.setSubmitting(false);
      actions.setStatus("submitted");
      setShowDialogOpen(false);
    } else {
      // unknown error
      actions.setSubmitting(false);
    }
    setCalendarLoading(false);
  };

  const transformEventForFullCalendar = (values, id) => {
    return {
      id: id,
      title: values.title,
      artists: values.artists,
      start: values.start,
      end: values.end,
      status: values.status[0].value,
      published: false,
      backgroundColor:
        values.status == "TBC"
          ? "#EDB8B4"
          : values.status == "Confirmed"
          ? "#F1E2AF"
          : values.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      borderColor:
        values.status == "TBC"
          ? "#EDB8B4"
          : values.status == "Confirmed"
          ? "#F1E2AF"
          : values.status == "Submitted"
          ? "#B3DCC1"
          : "#B3DCC1",
      booker: values.booker ? values.booker : "George",
    };
  };

  const _handleDelete = async (id) => {
    setCalendarLoading(true);
    const JSONData = JSON.stringify({
      id: id,
    });
    const endpoint = "/api/calendar";
    const options = {
      // The method is POST because we are sending data.
      method: "DELETE",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONData,
    };
    const response = await fetch(endpoint, options);
    if (response.status === 400) {
      // Validation error
    } else if (response.ok) {
      // successful
      console.log("show deleted successfully");
      setShowDialogOpen(false);
      // manually delete show from full calendar
      let calendarApi = calendarRef.current.getApi();
      calendarApi.getEventById(id).remove();
    } else {
      // unknown error
    }
    setCalendarLoading(false);
  };

  function _handleSelect(selectInfo) {
    console.log("select info");
    setShowDialogOpen(true);
    setSelectedShow(selectInfo);
    console.log(selectInfo.startStr);
  }

  function _handleEventClick(eventInfo) {
    // remove UTC timezone stamp
    setShowDialogOpen(true);
    setSelectedShow(eventInfo.event);
  }

  const _handleEventDrop = async (eventInfo) => {
    setCalendarLoading(true);
    console.log("handle drop: " + eventInfo);
    const values = {
      id: eventInfo.event.id,
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
    };
    console.log(values);
    const JSONData = JSON.stringify(values);
    const endpoint = "/api/calendar";
    const options = {
      // The method is POST because we are sending data.
      method: values.id ? "PATCH" : "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONData,
    };
    console.log(options);
    const response = await fetch(endpoint, options);
    if (response.status === 400) {
      // Validation error
      reloadCalendar();
    } else if (response.ok) {
      // successful
      console.log("form submitted successfully");
    } else {
      // unknown error
      reloadCalendar();
    }
    setCalendarLoading(false);
  };

  const reloadCalendar = () => {
    console.log("reloading calendar");
    let calendarApi = calendarRef.current.getApi();
    calendarApi.refetchEvents();
  };

  return (
    <div className="m-8 h-[calc(100vh-151px)] relative">
      {/* <pre className="text-white bg-black">
        {JSON.stringify(shows, null, 2)}
      </pre> */}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
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
        nextDayThreshold="09:00:00"
        slotDuration="00:30:00"
        slotMaxTime="26:00:00"
        slotMinTime="10:00:00"
        dayHeaderContent={(args) => {
          return dayjs(args.date).format("ddd DD/MM");
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
          hour12: false,
        }}
        eventClick={_handleEventClick}
        eventDrop={_handleEventDrop}
        eventResize={_handleEventDrop}
        dateClick={handleDateClick}
        eventAdd={handleEventAdd}
        select={_handleSelect}
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
          className={`animate-refresh ${calendarLoadingIcon ? "" : "pause"}
          }`}
        />
      </button>
      <DropdownMenu.Root
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
      </DropdownMenu.Root>

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
              <Dialog.Title asChild className="mb-6 pb-3 border-b border-black">
                <h5 className="font-sans font-medium">
                  {selectedShow?.title ? "Edit" : "New"} show
                  {selectedShow?.id && (
                    <Link
                      target="_blank"
                      href={`https://app.contentful.com/spaces/taoiy3h84mql/environments/master/entries/${selectedShow.id}`}
                    >
                      <RxExternalLink className="inline ml-2 mb-1" />
                    </Link>
                  )}
                </h5>
              </Dialog.Title>
              {/* <Dialog.Description className=""></Dialog.Description> */}
              {/* <pre className="text-white bg-black h-96 overflow-scroll">
                {JSON.stringify(selectedShow.extendedProps, null, 2)}
              </pre> */}
              <Formik
                innerRef={formRef}
                initialValues={initialValues}
                onSubmit={_handleSubmit}
              >
                {({ values, isSubmitting }) => (
                  <Form id="calendarShow">
                    <Field type="hidden" name="id" />
                    <InputField
                      name="title"
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
                      limit={1}
                      value={initialValues.status}
                    />
                    <InputField
                      name="booker"
                      label="Booker"
                      required
                      type="text"
                    />
                    <div className="flex justify-between items-center mt-6">
                      <button
                        type="submit"
                        className="inline-flex items-center space-x-4 text-base font-medium"
                      >
                        <span className="underline">
                          {selectedShow?.title ? "Edit" : "Add"} show{" "}
                        </span>
                        {!isSubmitting && <Arrow />}
                        {isSubmitting && (
                          <AiOutlineLoading3Quarters className="animate-spin" />
                        )}
                      </button>
                      {selectedShow?.title && (
                        <button
                          type="button"
                          className="cursor-pointer"
                          value="delete"
                          onClick={() => {
                            _handleDelete(values.id);
                          }}
                        >
                          <RiDeleteBin7Line />
                        </button>
                      )}
                    </div>
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
  return (
    <div className="p-1">
      <div className="mt-1 flex justify-between">
        <p className="text-xxs font-medium">{eventInfo.timeText} </p>
        <p className="text-xxs italic">
          {eventInfo.event.extendedProps.booker}
        </p>
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
