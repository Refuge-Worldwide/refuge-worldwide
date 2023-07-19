import Layout from "../components/layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import useSchedule from "../hooks/useSchedule";
import Loading from "../components/loading";

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
  const { scheduleData, isLoading, error } = useSchedule();
  console.log(scheduleData);
  if (isLoading) return <Loading />;
  if (error) return <div>Fail to Load Schedule</div>;

  return (
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
      initialEvents={scheduleData.schedule}
      eventContent={renderEventContent}
      endParam="dateEnd"
      startParam="date"
    />
  );
}

function renderEventContent(eventInfo) {
  console.log(eventInfo);
  return (
    <div className="p-1">
      <p className="text-xxs font-medium mt-1">{eventInfo.timeText}</p>
      <p className="text-small">{eventInfo.event.title}</p>
    </div>
  );
}

function handleEventClick(eventInfo) {
  console.log("event clicked");
  console.log(eventInfo);
}

function handleDateClick(eventInfo) {
  console.log("date clicked");
  console.log(eventInfo);
}

function handleEventAdd(eventInfo) {
  console.log("event added");
  console.log(eventInfo);
}

function handleSelect(selectInfo) {
  console.log("select info");
  console.log(selectInfo);
  alert("Create new show popup");
}
