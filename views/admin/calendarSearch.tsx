import * as Dialog from "@radix-ui/react-dialog";
import { InferGetStaticPropsType } from "next";
import { isEmpty } from "ts-extras";
import { useEffect, useState } from "react";
import { Cross } from "../../icons/cross";
import InputField from "../../components/formFields/inputField";
import { useCalendarSearchData } from "../../hooks/useSearch";
import { useDebouncedState } from "@react-hookz/web";
import Loading from "../../components/loading";
import { TfiSearch } from "react-icons/tfi";
import { RxExternalLink } from "react-icons/rx";
import Date from "../../components/date";
import Link from "next/link";

export default function CalendarSearch({ onView, onEdit, onToggle }) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const [query, querySet] = useDebouncedState("", 500);

  const { data, isValidating } = useCalendarSearchData(query);

  useEffect(() => {
    onToggle(dialogOpen);
  }, [dialogOpen]);

  const transformShowToFullCalendarFormat = (show) => {
    return {
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
        email: show.email ? show.email : true,
        type: show.type ? show.type : "live",
      },
    };
  };

  return (
    <Dialog.Root
      open={dialogOpen}
      onOpenChange={(dialogOpen) => setDialogOpen(dialogOpen)}
    >
      <Dialog.Trigger asChild>
        <button className="absolute top-1 lg:top-1.5 right-2 lg:right-9 hidden lg:block">
          <TfiSearch />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow w-screen h-screen fixed top-0 left-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="bg-white w-full h-full lg:h-auto lg:max-w-7xl lg:max-h-[80vh] overflow-auto fixed top-16 left-1/2 transform -translate-x-1/2 z-50 border-black border p-4">
          <Dialog.Close asChild>
            <button className="float-right lg:hidden" aria-label="Close">
              <Cross />
            </button>
          </Dialog.Close>
          <input
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="pill-input sticky top-0"
            id="search"
            name="search"
            onChange={(ev) => querySet(ev.target.value)}
            placeholder="Search for a show"
          />
          <div className="h-4"></div>
          {isValidating && (
            <section className="border-b-2 min-h-screen">
              <div className="container-md p-4 pb-[calc(1rem-2px)] sm:p-8 sm:pb-[calc(2rem-2px)]">
                <div className="pt-10 pb-10">
                  <p>
                    <Loading />
                  </p>
                </div>
              </div>
            </section>
          )}

          {data?.length == 0 && (
            <section className="px-2 py-10">
              <p>
                No results found for{" "}
                <span className="font-medium">{`"${query}"`}</span>
              </p>
            </section>
          )}

          {data?.length > 0 && (
            <section>
              <table className="table-fixed text-small text-left w-full">
                <thead>
                  <tr className="border-b border-black/75 mb-4 text-black/75">
                    <th className="font-light py-3 w-[35%]">Title</th>
                    <th className="font-light py-3 w-[15%]">Artists</th>
                    <th className="font-light py-3 w-[25%]">Date/time</th>
                    <th className="font-light py-3 w-[10%]">Status</th>
                    {/* <th className="font-light py-3 text-center">Status</th> */}
                  </tr>
                </thead>
                <tbody className="space-y-2 divide-y">
                  {data.map((show) => (
                    <tr className="my-2 border-black/20" key={show.id}>
                      <td className="py-3">
                        {show.isFeatured}
                        <p className="line-clamp-2">{show.title}</p>
                      </td>
                      <td className="py-3">
                        {show.artists &&
                          show.artists.map((artist, i) => (
                            <span key={artist.value}>
                              {i > 0 && ", "}
                              {artist.label}
                            </span>
                          ))}
                      </td>
                      <td className="py-3">
                        <Date
                          dateString={show.start}
                          formatString="DD MMM YYYY HH:mm—"
                        />
                        {show.end && (
                          <Date dateString={show.end} formatString="HH:mm" />
                        )}
                      </td>
                      <td className="py-3">
                        <div
                          className={`bg-calendar-${show.status.toLowerCase()} p-2 w-min text-tiny rounded-lg`}
                        >
                          {show.status}
                        </div>
                      </td>
                      <td className="py-3 flex items-center gap-4 justify-end h-full">
                        <button
                          className="border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg"
                          onClick={() => {
                            onView(show.start, show.id), setDialogOpen(false);
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            onEdit({
                              event: transformShowToFullCalendarFormat(show),
                            });
                          }}
                          className="border-black/75 hover:bg-black hover:text-white border px-2 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <Link
                          target="_blank"
                          href={`https://app.contentful.com/spaces/taoiy3h84mql/environments/master/entries/${show.id}`}
                        >
                          <RxExternalLink size={20} />
                        </Link>
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
