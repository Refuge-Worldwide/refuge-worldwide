import { list } from "postcss";
import Pill from "../../components/pill";
import UpcomingShowPreview from "../../components/upcomingShowPreview";
import useShows from "../../hooks/useShows";

export default function NextShows() {
  const { data } = useShows();

  return (
    <section className="bg-orange border-2">
      <div className="p-8">
        <Pill>
          <h2>Next Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {data?.upcoming?.slice(0, 3)?.map((show, i) => (
            <li key={i}>
              <UpcomingShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
