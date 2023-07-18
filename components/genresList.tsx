import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
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
  const [selectedGenres, setSelectedGenres] = useState<string>(filter[0]);
  const filterGenres = (query) => {
    SetGenreFilterQuery(query);
    const filteredGenres = genres.filter((genre) =>
      genre.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredGenres(filteredGenres);
  };
  const inputRef = useRef(null);

  useEffect(() => {
    setSelectedGenres(filter[0]);
  }, [filter]);

  const updateGenreParam = (genre: string) => () => {
    if (genre == selectedGenres) {
      router.push(`/radio`, undefined, {
        shallow: true,
      });
      setSelectedGenres("");
    } else {
      router.push(`/radio?genre=${encodeURIComponent(genre)}`, undefined, {
        shallow: true,
      });
      setSelectedGenres(genre);
      setFilterOpen(false);
    }
  };

  const openFilterHandler = () => {
    if (!filterOpen) {
      // set focus to input
      inputRef.current.focus();
    }
    setFilterOpen(!filterOpen);
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
      <div className="py-2 px-4 border-2 border-black rounded-full w-fit flex space-x-2 grow-1 relative">
        <Dialog.Trigger asChild>
          <button
            className={`text-tiny py-3 px-2 font-medium w-max ${
              filter ? "text-tiny" : "text-small"
            }`}
            aria-label="Open filter sidebar"
          >
            {!selectedGenres && (
              <span className="animate-pulse inline-flex h-3 w-3 mr-2 rounded-full bg-orange"></span>
            )}
            FILTER
            {!selectedGenres && <span className="bl"> BY GENRE </span>}
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
                      invert={filter.indexOf(genre) > -1}
                      cross
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
