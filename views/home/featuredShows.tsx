import Link from "next/link";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import { Arrow } from "../../icons/arrow";
import { ShowInterface } from "../../types/shared";

export default function FeaturedShows({ shows }: { shows: ShowInterface[] }) {
  return (
    <section>
      <div className="px-8 pt-12 pb-20">
        <Pill>
          <h2>Featured Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul className="flex w-full flex-wrap -mr-10 -mb-10">
          {shows.map((show, i) => (
            <li key={i} className="pr-10 pb-10">
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>

        <div className="h-20" />

        <div className="text-center">
          <Link href="/radio">
            <a className="inline-flex items-center space-x-4 font-medium">
              <span className="underline">All Shows</span>
              <Arrow />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
