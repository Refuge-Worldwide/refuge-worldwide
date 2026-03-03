import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { TfiSearch } from "react-icons/tfi";
import { RxExternalLink } from "react-icons/rx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import dayjs from "dayjs";
import type { CalendarConfig } from "../config";
import type { CalendarShow } from "../types";

interface CalendarSearchProps {
  config: CalendarConfig;
  onView: (date: string, showId: string) => void;
  onEdit: (eventInfo: { event: object }) => void;
  onToggle: (open: boolean) => void;
  searchEndpoint?: string;
}

export function CalendarSearch({
  config,
  onView,
  onEdit,
  onToggle,
  searchEndpoint = "/api/admin/search",
}: CalendarSearchProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CalendarShow[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync dialog open state to parent
  useEffect(() => {
    onToggle(dialogOpen);
  }, [dialogOpen]);

  // Debounce input → query
  useEffect(() => {
    const t = setTimeout(() => setQuery(inputValue), 400);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Fetch when query changes
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`${searchEndpoint}?query=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, searchEndpoint]);

  const contentfulBase =
    config.contentfulAppUrl ??
    `https://app.contentful.com/spaces/${config.contentful.spaceId}`;

  const transformToFCFormat = (show: CalendarShow) => ({
    id: show.id,
    title: show.title,
    startStr: show.start,
    endStr: show.end,
    extendedProps: {
      mixcloudLink: show.mixcloudLink,
      status: show.status,
      published: show.published,
      artists: show.artists,
      isFeatured: show.isFeatured,
      type: show.type,
    },
  });

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Trigger asChild>
        <button className="hidden lg:block">
          <TfiSearch />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-7xl lg:max-h-[80vh] overflow-auto fixed top-16 left-1/2 transform -translate-x-1/2 z-50 border-black border p-4">
          <input
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="pill-input sticky top-0"
            placeholder="Search for a show"
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="h-4" />

          {loading && (
            <div className="pt-10 pb-10 flex justify-center">
              <AiOutlineLoading3Quarters size={24} className="animate-spin" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <section className="px-2 py-10">
              <p>
                No results for{" "}
                <span className="font-medium">{`"${query}"`}</span>
              </p>
            </section>
          )}

          {results.length > 0 && (
            <section>
              <table className="table-fixed text-small text-left w-full">
                <thead>
                  <tr className="border-b border-black/75 mb-4 text-black/75">
                    <th className="font-light py-3 w-[35%]">Title</th>
                    <th className="font-light py-3 w-[15%]">Artists</th>
                    <th className="font-light py-3 w-[25%]">Date/time</th>
                    <th className="font-light py-3 w-[10%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((show) => (
                    <tr className="border-black/20" key={show.id}>
                      <td className="py-3">
                        <p className="line-clamp-2">{show.title}</p>
                      </td>
                      <td className="py-3">
                        {show.artists?.map((artist, i) => (
                          <span key={artist.value}>
                            {i > 0 && ", "}
                            {artist.label}
                          </span>
                        ))}
                      </td>
                      <td className="py-3">
                        {show.start &&
                          dayjs(show.start).format("DD MMM YYYY HH:mm")}
                        {show.end && "—" + dayjs(show.end).format("HH:mm")}
                      </td>
                      <td className="py-3">
                        <div
                          style={{ backgroundColor: show.backgroundColor }}
                          className="p-2 w-min text-tiny rounded-lg"
                        >
                          {show.status}
                        </div>
                      </td>
                      <td className="py-3 flex items-center gap-4 justify-end">
                        <button
                          className="border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg"
                          onClick={() => {
                            if (show.start) onView(show.start, show.id);
                            setDialogOpen(false);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg"
                          onClick={() =>
                            onEdit({ event: transformToFCFormat(show) })
                          }
                        >
                          Edit
                        </button>
                        <a
                          href={`${contentfulBase}/environments/master/entries/${show.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <RxExternalLink size={20} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
