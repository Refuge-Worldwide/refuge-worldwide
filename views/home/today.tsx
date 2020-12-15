import Pill from "../../components/pill";
import { TodaySection } from "../../lib/api";

export default function Today({ content }: TodaySection) {
  return (
    <section className="bg-orange border-t-2 border-b-2">
      <div className="md:flex">
        <div className="pt-4 pb-4 px-4 md:px-8 md:border-r-2">
          <Pill size="medium">
            <h2>Today</h2>
          </Pill>
        </div>
        <div className="md:pt-4 pb-4 px-4 md:px-0 flex items-center">
          <span className="font-medium md:whitespace-nowrap">{content}</span>
        </div>
      </div>
    </section>
  );
}
