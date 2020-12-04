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
    <section className="border-b-2 border-black">
      <div className="p-8">
        <Pill>
          <h2 className="px-6 py-3 leading-none">{alphabet}</h2>
        </Pill>

        <div className="h-8" />

        <ul className="flex flex-wrap -mr-8 -mb-8">
          {artists.map((artist, i) => (
            <li key={i} className="pr-8 pb-8">
              <Artist {...artist} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
