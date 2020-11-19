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
      <Pill>
        <h2>{alphabet}</h2>
      </Pill>

      <ul className="flex">
        {artists.map((artist, i) => (
          <li key={i}>
            <Artist {...artist} />
          </li>
        ))}
      </ul>
    </section>
  );
}
