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
      <div className="p-8">
        <Pill>
          <h2>{alphabet}</h2>
        </Pill>

        <div className="h-8" />

        <ul className="flex flex-wrap -mr-10 -mb-10">
          {artists.map((artist, i) => (
            <li key={i} className="pr-10 pb-10">
              <Artist {...artist} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
