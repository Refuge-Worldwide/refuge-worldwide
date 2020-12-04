import Link from "next/link";
import Pill from "../../components/pill";
import ShowPreview from "../../components/showPreview";
import { Arrow } from "../../icons/arrow";
import { ShowInterface } from "../../types/shared";

export default function FeaturedShows({ shows }: { shows: ShowInterface[] }) {
  return (
    <section>
      <div className="px-8 py-10">
        <Pill>
          <h2>Featured Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul className="flex flex-wrap">
          {shows.map((show, i) => (
            <li key={i}>
              <ShowPreview {...show} />
            </li>
          ))}
        </ul>

        <div className="h-16" />

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
