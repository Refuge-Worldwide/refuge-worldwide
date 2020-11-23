import Badge from "../../components/badge";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useShowsAndGenres from "../../hooks/useShowsAndGenres";

export default function AllShows() {
  const { data } = useShowsAndGenres(false);

  return (
    <section>
      <Pill>
        <h2>All Shows</h2>
      </Pill>

      <ul className="flex flex-wrap leading-none -mr-2 -mb-2">
        <li className="inline-flex pr-2 pb-2">
          <Badge invert text={"All"} />
        </li>
        {data?.genres?.map((genre, i) => (
          <li className="inline-flex pr-2 pb-2" key={i}>
            <Badge text={genre.name} />
          </li>
        ))}
      </ul>

      <ul className="flex">
        {data?.shows?.map((show, i) => (
          <li key={i}>
            <ShowPreview {...show} />
          </li>
        ))}
      </ul>
    </section>
  );
}
