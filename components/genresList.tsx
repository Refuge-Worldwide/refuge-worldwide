import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState, useRef } from "react";
import Badge from "./badge";
import { Cross } from "../icons/cross";

type GenreListProps = {
  genres: string[];
  filter: string[];
  filterSet: Dispatch<SetStateAction<string[]>>;
};

export default function GenresList({ filter, genres }: GenreListProps) {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filteredGenres, setFilteredGenres] = useState(genres);
  const [genreFilterQuery, SetGenreFilterQuery] = useState<string>("");
  const filterGenres = (query) => {
    SetGenreFilterQuery(query);
    const filteredGenres = genres.filter((genre) =>
      genre.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGenres(filteredGenres);
  };

  const inputRef = useRef(null);

  const updateGenreParam = (genre: string) => () => {
    if (filter && filter.includes(genre)) {
      const newFilters = filter.filter((g) => g !== genre);
      if (newFilters.length == 0) {
        router.push(`/radio`, undefined, {
          shallow: true,
        });
      } else {
        const genreURLQuery = newFilters.join("&genre=");
        console.log(genreURLQuery);
        router.push(`/radio?genre=${genreURLQuery}`, undefined, {
          shallow: true,
        });
      }
    } else {
      const newFilters = [...(filter ? filter : []), genre];
      const genreURLQuery = newFilters.join("&genre=");
      console.log(genreURLQuery);
      router.push(`/radio?genre=${genreURLQuery}`, undefined, {
        shallow: true,
      });

      setFilterOpen(false);
    }
  };

  // function sortActiveFilterAndAlpha(a: string, b: string) {
  //   if (a === filter && b !== filter) return -1;
  //   if (a !== filter && b === filter) return 1;
  //   return a.localeCompare(b, "en", { sensitivity: "base" });
  // }

  return (
    <Dialog.Root
      open={filterOpen}
      onOpenChange={(filterOpen) => setFilterOpen(filterOpen)}
    >
      <div className="rounded-full w-fit flex space-x-2 grow-1 relative">
        <Dialog.Trigger asChild>
          <button
            className={`text-tiny px-2 font-medium w-max ${
              filter ? "text-tiny" : "text-small"
            }`}
            aria-label="Open filter sidebar"
          >
            {!filter && (
              <span className="animate-pulse inline-flex h-3 w-3 mr-2 rounded-full bg-orange"></span>
            )}
            FILTER
            {!filter && <span className="bl"> BY GENRE </span>}
          </button>
        </Dialog.Trigger>
        {filter &&
          filter.map((genre, i) => (
            <button
              key={i}
              className="focus:outline-none focus:ring-4 rounded-full"
              onClick={updateGenreParam(genre)}
            >
              <Badge invert={true} cross text={genre} />
            </button>
          ))}
      </div>

      <Dialog.Portal>
        <Dialog.Content className={`genreSidebar`}>
          <Dialog.Title className="sr-only">Genre filter sidebar</Dialog.Title>
          <Dialog.Description className="sr-only">
            Filter shows by searching for genres or selecting from the list.
          </Dialog.Description>
          <div className="p-4 py-6 md:p-8 sticky top-0  bg-orange flex justify-between z-50 border-black border-b-2">
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="pill-input-transparent w-[85%]"
              id="genresSearch"
              name="search"
              value={genreFilterQuery}
              onChange={(ev) => filterGenres(ev.target.value)}
              placeholder="Search genres"
              ref={inputRef}
            />
            <Dialog.Close asChild>
              <button aria-label="Close">
                <Cross size={30} />
              </button>
            </Dialog.Close>
          </div>
          <ul className="p-4 md:p-8 pt-0 md:pt-0 w-full leading-none gap-2 mt-5 md:mt-6">
            {filteredGenres
              // .sort(sortActiveFilterAndAlpha)
              .map((genre, i) => (
                <li key={i} className="mb-2">
                  <button
                    className="focus:outline-none focus:ring-4 rounded-full"
                    onClick={updateGenreParam(genre)}
                  >
                    <Badge
                      invert={filter?.includes(genre)}
                      cross={filter?.includes(genre)}
                      text={genre}
                    />
                  </button>
                </li>
              ))}
          </ul>
        </Dialog.Content>
        <Dialog.Overlay className={`genreSidebarOverlay`} />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
