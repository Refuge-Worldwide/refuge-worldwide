import Badge from "../../components/badge";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useFilteredShows from "../../hooks/useFilteredShows";
import useGenreFilter from "../../hooks/useGenreFilter";
import useGenres from "../../hooks/useGenres";

export default function AllShows() {
  const { data: genres } = useGenres();
  const { filter, filterSet } = useGenreFilter();
  const { data: shows } = useFilteredShows(filter);

  return (
    <section>
      <div className="p-8">
        <Pill>
          <h2>All Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
          <li className="inline-flex pr-2 pb-2">
            <button
              className="focus:outline-none focus:ring-4 rounded-full"
              onClick={() => filterSet("All")}
            >
              <Badge invert={filter === "All"} text={"All"} />
            </button>
          </li>
          {genres?.map((genre, i) => (
            <li className="inline-flex pr-2 pb-2" key={i}>
              <button
                className="focus:outline-none focus:ring-4 rounded-full"
                onClick={() => filterSet(genre)}
              >
                <Badge invert={filter === genre} text={genre} />
              </button>
            </li>
          ))}
        </ul>

        <div className="h-4" />

        <ul className="flex flex-wrap -mr-10 -mb-10">
          {shows?.map((show, i) => (
            <li key={i} className="pr-10 pb-10">
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
