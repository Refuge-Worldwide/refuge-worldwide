import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Loading from "../../components/loading";
// import * as Dialog from "@radix-ui/react-dialog";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState, useEffect, useRef, useCallback } from "react";
// import InputField from "../../components/formFields/inputField";
// import MultiSelectField from "../../components/formFields/multiSelectField";
// import { Formik, Form, FieldArray, Field } from "formik";
// import { Cross } from "../../icons/cross";
// Add back in for calendar v2
// import {
//   getAllArtists,
//   deleteCalendarShow,
//   createCalendarShow,
//   updateCalendarShow,
//   createArtist,
//   updateArtistEmail,
// } from "../../lib/contentful/calendar";
import { Arrow } from "../../icons/arrow";
import CheckboxField from "../../components/formFields/checkboxField";
import { Close } from "../../icons/menu";
import { TfiReload } from "react-icons/tfi";
import { IoMdCheckmark, IoMdMusicalNote } from "react-icons/io";
import { RxExternalLink } from "react-icons/rx";
import { AiOutlineLoading3Quarters, AiOutlineCalendar } from "react-icons/ai";
import { RiDeleteBin7Line } from "react-icons/ri";
import Link from "next/link";
import dayjs from "dayjs";
import useWindowSize from "../../hooks/useWindowSize";

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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const calendarRef = useRef<any>();
  const formRef = useRef<any>();
  const datePicker = useRef<any>();
  const windowSize = useWindowSize();

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

  // Add back in for calendar v2

  // useEffect(() => {
  //   if (formRef.current) {
  //     console.log(formRef);
  //   }
  // }, [formRef]);

  useEffect(() => {
    if (!showDialogOpen) {
      // attach the event listener
      document.addEventListener("keydown", handleKeyPress);

      // remove the event listener
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [handleKeyPress, showDialogOpen]);

  // Add back in for calendar v2

  // const statusOptions = [
  //   {
  //     value: "TBC",
  //     label: "TBC",
  //   },
  //   {
  //     value: "Confirmed",
  //     label: "Confirmed",
  //   },
  //   {
  //     value: "Submitted",
  //     label: "Submitted",
  //   },
  // ];

  // useEffect(() => {
  //   (async () => {
  //     const artists = await getAllArtists();
  //     setArtists(artists);
  //   })();
  //   const interval = setInterval(() => reloadCalendar(), 60000);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // const initialValues = {
  //   id: selectedShow?.id,
  //   title: selectedShow?.title,
  //   start: selectedShow?.startStr,
  //   end: selectedShow?.endStr,
  //   artists: selectedShow?.extendedProps?.artists
  //     ? selectedShow?.extendedProps?.artists
  //     : [],
  //   status: [
  //     {
  //       value: selectedShow?.extendedProps?.status
  //         ? selectedShow?.extendedProps?.status
  //         : "TBC",
  //       label: selectedShow?.extendedProps?.status
  //         ? selectedShow?.extendedProps?.status
  //         : "TBC",
  //     },
  //   ],
  //   booker: selectedShow?.extendedProps?.booker,
  //   hasExtraArtists: false,
  //   extraArtists: [
  //     {
  //       name: "",
  //       pronouns: "",
  //     },
  //   ],
  // };

  // const handleSubmit = async (values, actions) => {
  //   const method = values.id ? "update" : "create";
  //   let show = null;
  //   setCalendarLoading(true);
  //   try {
  //     if (values.hasExtraArtists) {
  //       for (const artist of values.extraArtists) {
  //         // if ((artist.bio && artist.image) || (artist.bio !== "" && artist.image !== "")) {
  //         console.log("adding artist to contentful: " + artist.name);
  //         const contentfulNewArtist = await createArtist(artist);
  //         console.log(contentfulNewArtist);
  //         values.artists.push(contentfulNewArtist);
  //         // }
  //       }
  //     }

  //     // if (values.artistEmails) {
  //     //   console.log(values.artistEmails);
  //     //   for (const artist of values.artistEmails) {
  //     //     await updateArtistEmail(artist.id, artist.email);
  //     //   }
  //     // }

  //     if (method == "update") {
  //       show = await updateCalendarShow(values);
  //     } else {
  //       show = await createCalendarShow(values);
  //     }

  //     // manually add show to full calendar
  //     const calendarApi = calendarRef.current.getApi();
  //     const fcEvent = transformEventForFullCalendar(values, show);
  //     if (method == "update") {
  //       calendarApi.getEventById(values.id).remove();
  //     }
  //     calendarApi.addEvent(fcEvent);
  //     actions.setSubmitting(false);
  //     actions.setStatus("submitted");
  //     setShowDialogOpen(false);
  //     setCalendarLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //     throw error;
  //   }
  // };

  // const handleEventDrop = async (eventInfo) => {
  //   setCalendarLoading(true);
  //   console.log("handle drop: " + eventInfo);
  //   const values = {
  //     id: eventInfo.event.id,
  //     start: eventInfo.event.startStr,
  //     end: eventInfo.event.endStr,
  //   };
  //   updateCalendarShow(values)
  //     .then(() => {
  //       setCalendarLoading(false);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const handleDelete = async (id) => {
  //   setCalendarLoading(true);
  //   setIsDeleting(true);
  //   deleteCalendarShow(id)
  //     .then((entry) => {
  //       let calendarApi = calendarRef.current.getApi();
  //       calendarApi.getEventById(id).remove();
  //       setShowDialogOpen(false);
  //       setCalendarLoading(false);
  //       setIsDeleting(false);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const transformEventForFullCalendar = (values, id) => {
  //   return {
  //     id: id,
  //     title: values.title,
  //     artists: values.artists,
  //     start: values.start,
  //     end: values.end,
  //     status: values.status[0].value,
  //     published: false,
  //     backgroundColor:
  //       values.status == "TBC"
  //         ? "#EDB8B4"
  //         : values.status == "Confirmed"
  //         ? "#F1E2AF"
  //         : values.status == "Submitted"
  //         ? "#B3DCC1"
  //         : "#B3DCC1",
  //     borderColor:
  //       values.status == "TBC"
  //         ? "#EDB8B4"
  //         : values.status == "Confirmed"
  //         ? "#F1E2AF"
  //         : values.status == "Submitted"
  //         ? "#B3DCC1"
  //         : "#B3DCC1",
  //     booker: values.booker ? values.booker : "George",
  //   };
  // };

  // function handleSelect(selectInfo) {
  //   console.log("select info");
  //   setShowDialogOpen(true);
  //   setSelectedShow(selectInfo);
  //   console.log(selectInfo.startStr);
  // }

  function handleEventClick(eventInfo) {
    // remove UTC timezone stamp
    // setShowDialogOpen(true);
    // setSelectedShow(eventInfo.event);
    const url = `https://app.contentful.com/spaces/taoiy3h84mql/environments/master/entries/${eventInfo.id}`;
    window.open(url, "_blank");
  }

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

  if (windowSize.width)
    return (
      <div className="mt-2 lg:m-4 h-[calc(100vh-100px)] lg:h-[calc(100vh-125px)] relative">
        <PageMeta title="Calendar | Refuge Worldwide" path="signin/" />
        <FullCalendar
          ref={calendarRef}
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
          eventClick={handleEventClick}
          // Add back in for calendar v2
          // eventDrop={handleEventDrop}
          // eventResize={handleEventDrop}
          // select={handleSelect}
          loading={(e) => setCalendarLoading(e)}
          firstDay={1}
          initialView={windowSize.width < 765 ? "timeGridDay" : "timeGridWeek"}
          nowIndicator={true}
          // Add back in for calendar v2
          // editable={true}
          // selectable={true}
          selectMirror={true}
          events={getEvents}
          eventContent={renderEventContent}
        />
        <input
          type="date"
          className="absolute top-0 lg:top-12 right-12 lg:left-0 p-0 h-9 w-32 lg:h-0 lg:w-0 z-10 bg-transparent border-black border-2 rounded-full"
          ref={datePicker}
          onChange={handleDatePickerChange}
        ></input>
        <button
          className="hidden lg:block absolute top-1 left-2 lg:left-0"
          onClick={openDatePicker}
        >
          <AiOutlineCalendar size={25} />
        </button>
        <button
          className="absolute top-1 lg:top-2 right-2 lg:right-0 disabled:cursor-wait"
          onClick={reloadCalendar}
          disabled={calendarLoading}
        >
          {calendarLoading ? (
            <AiOutlineLoading3Quarters size={20} className="animate-spin" />
          ) : (
            <TfiReload size={20} />
          )}
        </button>
        {/* Add back in for calendar v2 */}
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

        {/* Add back in for calendar v2 */}
        {/* <Dialog.Root
          open={showDialogOpen}
          onOpenChange={(showDialogOpen) => setShowDialogOpen(showDialogOpen)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="w-screen h-screen fixed top-0 left-0 bg-black opacity-70 z-50" />
            <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-3xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border">
              <div className="relative p-8 overflow-y-scroll max-h-[95vh]">
                <Dialog.Close asChild>
                  <button className="float-right" aria-label="Close">
                    <Cross />
                  </button>
                </Dialog.Close>
                <Dialog.Title
                  asChild
                  className="mb-6 pb-3 border-b border-black"
                >
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
                <Formik
                  innerRef={formRef}
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
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

                      <FieldArray
                        name="artistEmails"
                        render={() => (
                          <div>
                            {values.artists
                              .filter((artist) => artist.email == null)
                              .map((artist, index) => (
                                <div key={"artistEmails" + index}>
                                  <input
                                    name={`artistEmails.${index}.name`}
                                    type="text"
                                    value={artist.label}
                                  />
                                  <input
                                    name={`artistEmails.${index}.id`}
                                    type="text"
                                    value={artist.value}
                                  />
                                  <InputField
                                    name={`artistEmails.${index}.email`}
                                    type="text"
                                    label={`Email for ${artist.label}`}
                                    required
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      />

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
                          className="inline-flex items-center space-x-4 text-base font-medium disabled:cursor-not-allowed"
                          disabled={isSubmitting}
                        >
                          <span className="underline">
                            {selectedShow?.title ? "Save" : "Add"}
                          </span>
                          {isSubmitting ? (
                            <AiOutlineLoading3Quarters className="animate-spin" />
                          ) : (
                            <Arrow />
                          )}
                        </button>
                        {selectedShow?.title && (
                          <button
                            type="button"
                            className="cursor-pointer disabled:cursor-not-allowed"
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
                        )}
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root> */}
      </div>
    );

  return <Loading />;
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

async function getEvents(info: any) {
  const response = await fetch(
    `/api/calendar?start=${info.startStr}&end=${info.endStr}`
  );
  const shows = await response.json();
  return shows.processed;
}
