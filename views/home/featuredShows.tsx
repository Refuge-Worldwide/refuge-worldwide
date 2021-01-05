import Link from "next/link";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import { Arrow } from "../../icons/arrow";
import { ShowInterface } from "../../types/shared";

export default function FeaturedShows({ shows }: { shows: ShowInterface[] }) {
  return (
    <section>
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>Featured Shows</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-8">
          {shows.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>

        <div className="h-10 sm:h-16" />

        <div className="text-center">
          <Link href="/radio">
            <a className="inline-flex items-center space-x-4 text-base font-medium">
              <span className="underline">All Shows</span>
              <Arrow />
            </a>
          </Link>
        </div>

        <div className="h-8 sm:h-10" />
      </div>
    </section>
  );
}
