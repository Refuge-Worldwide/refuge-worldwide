import Image from "next/image";
import Link from "next/link";
import Genre from "../../components/genre";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import useShowsAndGenres from "../../hooks/useShowsAndGenres";
import { formatArtistNames } from "../../util";

export default function AllShows() {
  const { data } = useShowsAndGenres(false);

  return (
    <section>
      <Pill>
        <h2>All Shows</h2>
      </Pill>

      <ul className="flex">
        <li>
          <Genre active name={"All"} />
        </li>
        {data?.genres?.map((genre, i) => (
          <li key={i}>
            <Genre name={genre.name} />
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
