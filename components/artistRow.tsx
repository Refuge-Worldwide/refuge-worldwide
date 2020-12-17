import { ArtistInterface } from "../types/shared";
import Artist from "./artist";
import Pill from "./pill";

export default function ArtistRow({
  alphabet,
  artists,
}: {
  alphabet: string;
  artists: ArtistInterface[];
}) {
  return (
    <section className="border-t-2 border-black">
      <div className="p-4 sm:p-8">
        <Pill>
          <h2>{alphabet}</h2>
        </Pill>

        <div className="h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 sm:gap-8">
          {artists.map((artist, i) => (
            <li key={i}>
              <Artist {...artist} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
