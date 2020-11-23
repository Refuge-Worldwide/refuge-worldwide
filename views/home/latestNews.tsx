import Link from "next/link";
import Pill from "../../components/pill";
import { Arrow } from "../../icons/arrow";

export default function LatestNews() {
  return (
    <section>
      <Pill>
        <h2>News</h2>
      </Pill>

      <div className="text-center">
        <Link href="/news">
          <a className="inline-flex items-center space-x-4 font-medium">
            <span className="underline">All News</span>
            <Arrow />
          </a>
        </Link>
      </div>
    </section>
  );
}
