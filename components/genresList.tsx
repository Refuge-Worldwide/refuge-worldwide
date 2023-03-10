import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import Badge from "./badge";
import { Cross } from "../icons/cross";

type GenreListProps = {
  genres: string[];
  filter: string[];
  filterSet: Dispatch<SetStateAction<string[]>>;
};

export default function GenresList({ filter, genres }: GenreListProps) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState<Boolean>(false);
  const [filteredGenres, setFilteredGenres] = useState(genres);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(filter);
  const filterGenres = (query) => {
    const filteredGenres = genres.filter((genre) =>
      genre.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGenres(filteredGenres);
  };

  const updateGenreParam = (genre: string) => () => {
    router.push(`/radio?genre=${encodeURIComponent(genre)}`, undefined, {
      shallow: true,
    });
  };

  // function sortActiveFilterAndAlpha(a: string, b: string) {
  //   if (a === filter && b !== filter) return -1;
  //   if (a !== filter && b === filter) return 1;
  //   return a.localeCompare(b, "en", { sensitivity: "base" });
  // }

  return (
    <div>
      <div className="py-2 px-4 border-wicked-dashed rounded-full w-fit flex space-x-2">
        <button
          className="text-tiny py-3 px-2 font-medium"
          onClick={() => setFilterOpen(true)}
        >
          FILTER
        </button>
        {filter.map((genre, i) => (
          <button
            key={i}
            className="focus:outline-none focus:ring-4 rounded-full"
          >
            <Badge invert={true} text={genre} />
          </button>
        ))}
      </div>
      <div
        className={`fixed top-0 left-0 flex h-screen w-screen z-50 ${
          filterOpen ? "block" : "hidden"
        }`}
      >
        <div
          className={`left-0 w-[300px] md:w-[376px] bg-orange overflow-y-auto genre-sidebar`}
        >
          <div className="p-4 md:p-8 sticky top-0  bg-orange flex justify-between">
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="pill-input-transparent w-[85%]"
              id="genresSearch"
              name="search"
              onChange={(ev) => filterGenres(ev.target.value)}
              placeholder="Search genres"
            />
            <button onClick={() => setFilterOpen(false)}>
              <Cross size={30} />
            </button>
          </div>
          <ul className="p-4 md:p-8 pt-0 md:pt-0 w-full leading-none gap-2 mt-1">
            {filteredGenres
              // .sort(sortActiveFilterAndAlpha)
              .map((genre, i) => (
                <li key={i} className="mb-2">
                  <button
                    className="focus:outline-none focus:ring-4 rounded-full"
                    onClick={updateGenreParam(genre)}
                  >
                    <Badge invert={filter.indexOf(genre) > -1} text={genre} />
                  </button>
                </li>
              ))}
          </ul>
        </div>
        <button
          className="h-full bg-black opacity-50 flex grow"
          onClick={() => setFilterOpen(false)}
        ></button>
      </div>
    </div>
  );
}
