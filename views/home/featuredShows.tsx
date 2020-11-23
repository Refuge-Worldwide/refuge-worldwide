import Link from "next/link";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";

export default function FeaturedShows() {
  return (
    <section>
      <Pill>
        <h2>Featured Shows</h2>
      </Pill>

      <div className="text-center">
        <Link href="/radio">
          <a className="inline-flex items-center space-x-4 font-medium">
            <span className="underline">All Shows</span>
            <Arrow />
          </a>
        </Link>
      </div>
    </section>
  );
}
