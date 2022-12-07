import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import Badge from "./badge";

type GenreListProps = {
  genres: string[];
  filter: string;
  filterSet: Dispatch<SetStateAction<string>>;
};

const INITIAL_SHOW_COUNT = 40;

export default function GenresList({ filter, genres }: GenreListProps) {
  const router = useRouter();

  const [showCount, showCountSet] = useState(INITIAL_SHOW_COUNT);

  const updateGenreParam = (genre: string) => () => {
    router.push(`/radio?genre=${encodeURIComponent(genre)}`, undefined, {
      shallow: true,
    });
  };

  function sortActiveFilterAndAlpha(a: string, b: string) {
    if (a === filter && b !== filter) return -1;
    if (a !== filter && b === filter) return 1;
    return a.localeCompare(b, "en", { sensitivity: "base" });
  }

  return (
    <ul className="w-full flex flex-wrap leading-none gap-2">
      <li className="inline-flex">
        <button
          className="focus:outline-none focus:ring-4 rounded-full"
          onClick={updateGenreParam("All")}
        >
          <Badge invert={filter === "All"} text={"All"} />
        </button>
      </li>

      {genres
        .sort(sortActiveFilterAndAlpha)
        .slice(0, showCount)
        .map((genre, i) => (
          <li className="inline-flex" key={i}>
            <button
              className="focus:outline-none focus:ring-4 rounded-full"
              onClick={updateGenreParam(genre)}
            >
              <Badge invert={filter === genre} text={genre} />
            </button>
          </li>
        ))}

      {showCount < genres.length && (
        <li className="inline-flex">
          <button
            onClick={() => showCountSet((count) => count + INITIAL_SHOW_COUNT)}
            className="focus:outline-none focus:ring-4 rounded-full"
          >
            <Badge invert text={"Show More"} />
          </button>
        </li>
      )}
    </ul>
  );
}
