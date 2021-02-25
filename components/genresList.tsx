import { Dispatch, SetStateAction, useState } from "react";
import Badge from "./badge";
import { useMedia } from "react-use";

type Props = {
  genres: string[];
  filter: string;
  filterSet: Dispatch<SetStateAction<string>>;
};

export default function GenresList({ filter, filterSet, genres }: Props) {
  const isLarge = useMedia("(min-width: 1024px)", true);

  const [showCount, showCountSet] = useState(isLarge ? 40 : 10);

  return (
    <ul className="w-full flex flex-wrap leading-none -mr-2 -mb-2">
      <li className="inline-flex pr-2 pb-2">
        <button
          className="focus:outline-none focus:ring-4 rounded-full"
          onClick={() => filterSet("All")}
        >
          <Badge invert={filter === "All"} text={"All"} />
        </button>
      </li>

      {genres.slice(0, showCount)?.map((genre, i) => (
        <li className="inline-flex pr-2 pb-2" key={i}>
          <button
            className="focus:outline-none focus:ring-4 rounded-full"
            onClick={() => filterSet(genre)}
          >
            <Badge invert={filter === genre} text={genre} />
          </button>
        </li>
      ))}

      {showCount < genres.length && (
        <li className="inline-flex pr-2 pb-2">
          <button
            onClick={() => showCountSet((count) => count + 10)}
            className="focus:outline-none focus:ring-4 rounded-full"
          >
            <Badge invert text={"Show More"} />
          </button>
        </li>
      )}
    </ul>
  );
}
