import Link from "next/link";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";
import { ShowInterface } from "../../types/shared";

export default function FeaturedShows({ shows }: { shows: ShowInterface[] }) {
  return (
    <section>
      <div className="px-8 py-10">
        <Pill>
          <h2 className="px-6 py-3 leading-none">Featured Shows</h2>
        </Pill>

        <div className="h-8" />

        <ul>
          {shows.map((show, i) => (
            <li key={i}>{show.title}</li>
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
