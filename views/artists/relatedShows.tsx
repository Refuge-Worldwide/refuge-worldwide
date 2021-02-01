import Pill from "../../components/pill";
import RelatedShowPreview from "../../components/relatedShowPreview";
import { ShowInterface } from "../../types/shared";

type Props = {
  shows: ShowInterface[];
  title?: string;
};

export default function RelatedShows({
  shows,
  title = "Related Shows",
}: Props) {
  return (
    <section className="border-b-2 border-white bg-black">
      <div className="p-4 sm:p-8">
        <Pill invert>
          <h2>{title}</h2>
        </Pill>

        <div className="h-5 sm:h-8" />

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {shows.map((show, i) => (
            <li key={i}>
              <RelatedShowPreview {...show} />
            </li>
          ))}
        </ul>

        <div className="h-10" />
      </div>
    </section>
  );
}
