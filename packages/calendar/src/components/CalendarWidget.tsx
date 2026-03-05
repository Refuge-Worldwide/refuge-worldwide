import * as React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { AiOutlineLoading3Quarters, AiOutlineCalendar } from "react-icons/ai";
import { TfiReload } from "react-icons/tfi";
import { IoMdCheckmark, IoMdMusicalNote } from "react-icons/io";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { createClient } from "contentful-management";
import dayjs from "dayjs";

import type { CalendarConfig, ShowNotificationData } from "../config";
import type { ShowFormValues, MutationResult } from "../types";
import { useContentfulAuth } from "../hooks/useContentfulAuth";
import { updateCalendarShow } from "../lib/mutations";
import { ShowDialog } from "./ShowDialog";
import { CalendarSearch } from "./CalendarSearch";

interface CalendarWidgetProps {
  config: CalendarConfig;
  /** Slot for station-specific actions (e.g. artwork exports). Rendered next to the reload button. */
  additionalActions?: React.ReactNode;
  /** Override the calendar API endpoint. Default: /api/admin/calendar */
  calendarApiPath?: string;
  /** Override the search/artist API endpoint. Default: /api/admin/search */
  searchApiPath?: string;
}

function makeRenderEventContent(prerecordValue: string) {
  return function renderEventContent(eventInfo: any) {
    return (
      <div className="p-1" id={eventInfo.event.id}>
        <div className="mt-1 flex justify-between">
          <p className="text-xxs font-medium">{eventInfo.timeText}</p>
          {eventInfo.event.extendedProps.type === prerecordValue && (
            <p className="text-xxs border border-black/20 opacity-80 bg-black text-white px-1 rounded">
              Pre-rec
            </p>
          )}
        </div>
        <p className="text-tiny mt-1 line-clamp-2 slot-title">
          {eventInfo.event.title}
        </p>
        <p className="text-xxs mt-1">
          {eventInfo.event.extendedProps.artists?.map(
            (artist: any, i: number) => (
              <span key={i}>
                {i > 0 && ", "}
                {artist.label}
              </span>
            )
          )}
        </p>
        <div className="absolute bottom-1 right-1 flex">
          {eventInfo.event?.extendedProps?.isFeatured && <span>🍊</span>}
          {eventInfo.event?.extendedProps?.mixcloudLink && (
            <IoMdMusicalNote opacity={0.5} />
          )}
          {eventInfo.event?.extendedProps?.published && (
            <IoMdCheckmark opacity={0.5} />
          )}
        </div>
      </div>
    );
  };
}

export function CalendarWidget({
  config,
  additionalActions,
  calendarApiPath = "/api/admin/calendar",
  searchApiPath = "/api/admin/search",
}: CalendarWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [showDialogOpen, setShowDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<any>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [highlightedShow, setHighlightedShow] = useState<string | null>(null);

  const calendarRef = useRef<any>();
  const datePicker = useRef<any>();
  const prevShowDialogOpen = useRef(false);
  const router = useRouter();
  const auth = useContentfulAuth(config);
  const contentfulClient =
    auth.status === "authenticated"
      ? createClient({ accessToken: auth.token })
      : null;

  useEffect(() => setMounted(true), []);

  // Refetch events whenever the dialog closes so the calendar is always in
  // sync with the server — avoids duplicates from mixing addEvent + fetch.
  useEffect(() => {
    if (prevShowDialogOpen.current && !showDialogOpen) {
      calendarRef.current?.getApi()?.refetchEvents();
    }
    prevShowDialogOpen.current = showDialogOpen;
  }, [showDialogOpen]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    if (e.key === "ArrowLeft") api.prev();
    else if (e.key === "ArrowRight") api.next();
    else if (e.key === "w") api.changeView("timeGridWeek");
    else if (e.key === "d") api.changeView("timeGridDay");
    else if (e.key === "a") api.changeView("listMonth");
    else if (e.key === "r") api.refetchEvents();
  }, []);

  useEffect(() => {
    if (showDialogOpen || searchDialogOpen) return;
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, showDialogOpen, searchDialogOpen]);

  const getInitialView = () => {
    if (typeof window !== "undefined" && window.innerWidth < 765)
      return "timeGridDay";
    if (router.query?.view) return router.query.view.toString();
    return "timeGridWeek";
  };

  const handleSelect = (selectInfo: any) => {
    setSelectedShow(selectInfo);
    setShowDialogOpen(true);
  };

  const handleEventClick = (eventInfo: any) => {
    setSelectedShow(eventInfo.event);
    setShowDialogOpen(true);
  };

  const renderEventContent = useMemo(
    () => makeRenderEventContent(config.typeValues.prerecord),
    [config.typeValues.prerecord]
  );

  const handleEventDrop = async (eventInfo: any) => {
    if (!contentfulClient) return;
    setCalendarLoading(true);
    updateCalendarShow(
      {
        id: eventInfo.event.id,
        start: eventInfo.event.startStr,
        end: eventInfo.event.endStr,
      },
      contentfulClient,
      config
    )
      .then(() => {
        setCalendarLoading(false);
        toast.success("Show updated");
      })
      .catch(() => {
        toast.error("Error moving show");
        setCalendarLoading(false);
      });
  };

  const handleShowSaved = (
    show: MutationResult,
    values: ShowFormValues,
    method: "create" | "update",
    keepOpen = false
  ) => {
    if (!keepOpen) {
      setShowDialogOpen(false);
      setCalendarLoading(false);
      toast.success(method === "update" ? "Show updated" : "Show created");
    }

    if (!keepOpen && show.confirmationEmail && config.onShowConfirmed) {
      const showData: ShowNotificationData = {
        id: values.id ?? "",
        title: values.title ?? "",
        date: values.start,
        dateEnd: values.end,
        participants: (values.artists ?? []).map((a) => ({
          name: a.label,
          email: a.email ?? [],
        })),
      };

      toast.promise(config.onShowConfirmed(showData), {
        loading: "Sending confirmation email…",
        success: "Confirmation email sent",
        error: "Failed to send confirmation email",
      });
    }
  };

  const handleShowDeleted = (id: string) => {
    calendarRef.current?.getApi().getEventById(id)?.remove();
    setShowDialogOpen(false);
    setCalendarLoading(false);
    toast.success("Show deleted");
  };

  const goToHighlightedShow = (date: string, showId: string) => {
    const api = calendarRef.current?.getApi();
    api?.gotoDate(date);
    setHighlightedShow(showId);
    setTimeout(() => {
      if (!calendarLoading) highlightShow(showId);
    }, 300);
  };

  const highlightShow = (showId: string) => {
    setTimeout(() => {
      const el = document.getElementById(showId)?.parentElement;
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.add("fc-highlighted-event");
      setHighlightedShow(null);
      setTimeout(() => el.classList.remove("fc-highlighted-event"), 10000);
    }, 100);
  };

  const handleCalendarLoading = useCallback(
    (loading: boolean) => {
      setCalendarLoading(loading);
      if (!loading && highlightedShow) highlightShow(highlightedShow);
    },
    [highlightedShow]
  );

  const handleDatesSet = useCallback(
    (dateInfo: any) => {
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
    },
    [router]
  );

  const getEvents = useCallback(
    async (info: any) => {
      const res = await fetch(
        `${calendarApiPath}?start=${info.startStr}&end=${info.endStr}`
      );
      const shows = await res.json();
      return shows.processed;
    },
    [calendarApiPath]
  );

  if (!mounted || !router.isReady || auth.status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <AiOutlineLoading3Quarters size={32} className="animate-spin" />
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Redirecting to Contentful…</p>
      </div>
    );
  }

  if (auth.status === "error") {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{auth.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-2 lg:m-4 h-[calc(100vh-100px)] lg:h-[calc(100vh-125px)] relative">
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

      <FullCalendar
        ref={calendarRef}
        initialDate={router.query?.start?.toString()}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay,listMonth",
        }}
        expandRows={true}
        height="100%"
        allDaySlot={false}
        scrollTime="10:00:00"
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
        dayHeaderContent={(args) => dayjs(args.date).format("ddd DD/MM")}
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
        loading={handleCalendarLoading}
        firstDay={1}
        initialView={getInitialView()}
        nowIndicator={true}
        selectMirror={true}
        datesSet={handleDatesSet}
        events={getEvents}
        eventContent={renderEventContent}
        scrollTimeReset={false}
      />

      {/* Date picker (mobile) */}
      <input
        type="date"
        className="absolute top-0 lg:top-12 right-20 lg:left-0 p-0 h-9 w-32 lg:h-0 lg:w-0 z-10 bg-transparent border-black border-2 lg:border-0 rounded-full"
        ref={datePicker}
        onChange={() =>
          calendarRef.current?.getApi().gotoDate(datePicker.current.value)
        }
      />
      <button
        className="hidden lg:block absolute top-1 left-2 lg:left-0"
        onClick={() => datePicker.current?.showPicker()}
      >
        <AiOutlineCalendar size={25} />
      </button>

      {/* Toolbar: search + reload + additional actions */}
      <div className="flex items-center gap-2 absolute top-1.5 right-2 lg:right-0">
        <CalendarSearch
          config={config}
          onView={goToHighlightedShow}
          onEdit={handleEventClick}
          onToggle={setSearchDialogOpen}
          searchEndpoint={searchApiPath}
        />
        <button
          className="disabled:cursor-wait"
          onClick={() => calendarRef.current?.getApi().refetchEvents()}
          disabled={calendarLoading}
        >
          {calendarLoading ? (
            <AiOutlineLoading3Quarters size={20} className="animate-spin" />
          ) : (
            <TfiReload size={20} />
          )}
        </button>
        {additionalActions}
      </div>

      {/* Show create/edit dialog */}
      {contentfulClient && (
        <ShowDialog
          open={showDialogOpen}
          onOpenChange={setShowDialogOpen}
          selectedShow={selectedShow}
          config={config}
          client={contentfulClient}
          searchEndpoint={searchApiPath}
          onShowSaved={handleShowSaved}
          onShowDeleted={handleShowDeleted}
        />
      )}
    </div>
  );
}
