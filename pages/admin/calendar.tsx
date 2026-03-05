import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { CalendarWidget } from "@refuge-worldwide/calendar/components";
import AdditionalMenu from "../../views/admin/additionalMenu";
import calendarConfig from "../../contentful-calendar.config";

export default function CalendarPage() {
  return (
    <Layout>
      <PageMeta title="Calendar | Refuge Worldwide" path="admin/calendar/" />
      <div className="calendar-container">
        <CalendarWidget
          config={calendarConfig}
          additionalActions={<AdditionalMenu />}
        />
      </div>
    </Layout>
  );
}
