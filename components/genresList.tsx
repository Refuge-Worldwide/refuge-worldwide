import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useMediaQuery } from "@react-hookz/web";
import Badge from "./badge";

type GenreListProps = {
  genres: string[];
  filter: string;
  filterSet: Dispatch<SetStateAction<string>>;
};

export default function GenresList({ filter, genres }: GenreListProps) {
  const router = useRouter();

  const isLarge = useMediaQuery("(min-width: 1024px)");

  const [showCount, showCountSet] = useState(isLarge ?? true ? 40 : 10);

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
          <li className="inline-flex pr-2 pb-2" key={i}>
            <button
              className="focus:outline-none focus:ring-4 rounded-full"
              onClick={updateGenreParam(genre)}
            >
              <Badge invert={filter === genre} text={genre} />
            </button>
          </li>
        ))}

      {showCount < genres.length && (
        <li className="inline-flex pr-2 pb-2">
          <button
            onClick={() => showCountSet((count) => count + 40)}
            className="focus:outline-none focus:ring-4 rounded-full"
          >
            <Badge invert text={"Show More"} />
          </button>
        </li>
      )}
    </ul>
  );
}
