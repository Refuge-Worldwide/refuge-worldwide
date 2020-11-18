import Image from "next/image";
import Link from "next/link";
import Pill from "../../components/pill";
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
        {data?.genres?.map((genre, i) => (
          <li key={i}>{genre.name}</li>
        ))}
      </ul>

      <ul>
        {data?.shows?.map((show, i) => (
          <li key={i}>
            <Link href={`/radio/${show.slug}`}>
              <a>
                <article>
                  <Image
                    src={show.coverImage.url}
                    width={340}
                    height={190}
                    className="object-cover object-center"
                    alt={show.title}
                  />
                  <h2>{show.title}</h2>
                  <p>{formatArtistNames(show.artistsCollection.items)}</p>
                  <ul className="flex">
                    {show.genresCollection.items.map((genre, i) => (
                      <li key={i}>{genre.name}</li>
                    ))}
                  </ul>
                </article>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
