// import { AddToCalendarButton } from "add-to-calendar-button-react";

export default function ShowSubmissionStep4(initial) {
  return (
    <div className="mb-64 mt-32 max-w-2xl mx-auto">
      <h3 className="font-sans text-large font-medium text-center max-w-prose">
        Show submission successful!
      </h3>
      <p className="text-center">
        We’ll be in touch with artwork and more information a day or two before
        your show.
      </p>
      {/* to do: add to calendar button */}
      {/* <AddToCalendarButton
        name="Title"
        options={["Apple", "Google", "iCal", "Outlook.com", "Yahoo"]}
        location="Weserstr. 166, 12045 Berlin"
        startDate="2023-12-15"
        endDate="2023-12-15"
        startTime="10:15"
        endTime="23:30"
        timeZone="Europe/Berlin"
      ></AddToCalendarButton> */}
    </div>
  );
}
