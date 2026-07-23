import ShowPreview from "../showPreview";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FavouritesContent() {
  const { data, error, isLoading } = useSWR("/api/user/likes", fetcher);

  return (
    <div>
      {isLoading && (
        <p className="text-small">Loading your favorite shows...</p>
      )}

      {error && <p className="text-small text-red">Error loading shows</p>}

      {data?.shows?.length === 0 && (
        <div className="border-2 border-black p-8 text-center">
          <p className="mb-4">You haven&apos;t liked any shows yet.</p>
          <Link
            href="/radio"
            className="inline-block bg-black text-white py-3 px-6 hover:bg-black/80 transition-colors"
          >
            Browse the Archive
          </Link>
        </div>
      )}

      {data?.shows?.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.shows.map((show: any) => (
            <li key={show.id}>
              <ShowPreview
                id={show.id}
                title={show.title}
                slug={show.slug}
                date={show.date}
                mixcloudLink={show.mixcloudLink}
                coverImage={show.coverImage}
                genres={show.genres}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
