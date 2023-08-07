import Layout from "../components/layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Loading from "../components/loading";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import InputField from "../components/formFields/inputField";
import { Formik } from "formik";
import { Cross } from "../icons/cross";
import { getAllArtists } from "../lib/contentful/pages/submission";

export default function CalendarPage() {
  const [artists, setArtists] = useState(getAllArtists);

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
  const [selectedShow, setSelectedShow] = useState(null);

  function handleSelect(selectInfo) {
    console.log("select info");
    console.log(selectInfo);
    setShowDialogOpen(true);
    setSelectedShow(selectInfo);
  }

  function handleEventClick(eventInfo) {
    setShowDialogOpen(true);
    setSelectedShow(eventInfo);
  }

  return (
    <div className="p-8 h-[calc(100vh-95px)]">
      {/* <pre className="text-white bg-black">
        {JSON.stringify(shows, null, 2)}
      </pre> */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,dayGridDay,listWeek",
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
        firstDay={1}
        initialView="timeGridWeek"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={getEvents}
        eventContent={renderEventContent}
      />
      <Dialog.Root
        open={showDialogOpen}
        onOpenChange={(showDialogOpen) => setShowDialogOpen(showDialogOpen)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen fixed top-0 left-0 bg-black opacity-70 z-50" />
          <Dialog.Content className="bg-white max-w-2xl fixed overflow-y-scroll max-h-screen top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-black border p-8">
            <Dialog.Close asChild>
              <button className="float-right" aria-label="Close">
                <Cross />
              </button>
            </Dialog.Close>
            <Dialog.Title asChild className="mb-6">
              <h5 className="font-sans font-medium">New show</h5>
            </Dialog.Title>
            {/* <Dialog.Description className=""></Dialog.Description> */}
            {/* <pre className="text-white bg-black h-96 overflow-scroll">
              {JSON.stringify(selectedShow, null, 2)}
            </pre> */}
            <Formik>
              <form>
                <InputField
                  name="showName"
                  label="Show name"
                  required
                  type="text"
                />
                <InputField
                  name="booker"
                  label="Booker"
                  required
                  type="text"
                  value="George"
                />
                <InputField
                  name="artist"
                  label="Artist(s)"
                  required
                  type="text"
                />
                <InputField
                  name="start"
                  label="Start"
                  required
                  type="datetime-local"
                  value={selectedShow?.startStr}
                />
                <InputField
                  name="end"
                  label="End"
                  required
                  type="datetime-local"
                  value={selectedShow?.endStr}
                />
              </form>
            </Formik>
            <Dialog.Close asChild>
              <button className="font-medium underline">Add show</button>
            </Dialog.Close>
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
        <p className="text-xxs font-medium">{eventInfo.timeText}</p>
        <p className="text-xxs font-medium ">Booker</p>
      </div>
      <p className="text-small">{eventInfo.event.title}</p>
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
  console.log(shows.processed);
  return shows.processed;
}
