import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Pill from "../../components/pill";
import { TodaySection } from "../../lib/api";

export default function Today({ content, header }: TodaySection) {
  if (content.json && typeof header === "string")
    return (
      <section className="bg-orange border-t-2 border-b-2">
        <div className="md:flex">
          <div className="pt-4 pb-4 px-4 md:px-8 md:border-r-2">
            <Pill size="medium">
              <h2 className="whitespace-nowrap">{header}</h2>
            </Pill>
          </div>
          <div className="md:pt-4 pb-4 px-4 md:px-0 flex items-center overflow-x-scroll">
            <span className="md:flex md:space-x-2 md:whitespace-nowrap md:px-4">
              {documentToReactComponents(content?.json)}
            </span>
          </div>
        </div>
      </section>
    );

  return null;
}
