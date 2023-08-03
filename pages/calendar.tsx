import Layout from "../components/layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
// import useSchedule from "../hooks/useSchedule";
import Loading from "../components/loading";
// import useCalendar from "../hooks/useCalendar";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

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
    <div>
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
        // height={"100vh - 100px"}
        hiddenDays={[0]}
        allDaySlot={false}
        scrollTime={"10:00:00"}
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
        endParam="dateEnd"
        startParam="date"
      />
      <Dialog.Root
        open={showDialogOpen}
        onOpenChange={(showDialogOpen) => setShowDialogOpen(showDialogOpen)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen fixed top-0 left-0 bg-black opacity-70 z-50" />
          <Dialog.Content className="bg-white max-w-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <Dialog.Title className="DialogTitle">New show</Dialog.Title>
            <Dialog.Description className="DialogDescription"></Dialog.Description>
            <pre className="text-white bg-black h-96 overflow-scroll">
              {JSON.stringify(selectedShow, null, 2)}
            </pre>
            <div
              style={{
                display: "flex",
                marginTop: 25,
                justifyContent: "flex-end",
              }}
            >
              <Dialog.Close asChild>
                <button className="Button green">Add show</button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button className="IconButton" aria-label="Close">
                Close
              </button>
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
