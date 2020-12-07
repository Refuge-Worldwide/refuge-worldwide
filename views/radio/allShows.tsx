import Badge from "../../components/badge";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useFilteredShows from "../../hooks/useFilteredShows";

export default function AllShows() {
  const { data } = useFilteredShows();

  return (
    <section>
      <div className="p-8">
        <Pill>
          <h2>All Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
          <li className="inline-flex pr-2 pb-2">
            <Badge invert text={"All"} />
          </li>
          {data?.genres?.map((genre, i) => (
            <li className="inline-flex pr-2 pb-2" key={i}>
              <Badge text={genre.name} />
            </li>
          ))}
        </ul>

        <div className="h-4" />

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {data?.shows?.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
