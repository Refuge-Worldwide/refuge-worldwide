import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Pill from "../../components/pill";
import { NextUpSection } from "../../lib/api";

export default function NextUp({ content, header }: NextUpSection) {
  if (content.json && typeof header === "string")
    return (
      <section className="bg-orange border-t-2 border-b-2">
        <div className="flex items-center">
          <div className="pt-4 pb-4 px-4 md:px-8 border-r-2">
            <Pill size="medium">
              <h2 className="whitespace-nowrap">{header}</h2>
            </Pill>
          </div>
          <div className="pt-4 pb-4 overflow-x-scroll hide-scrollbar">
            <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-4">
              {documentToReactComponents(content?.json)}
            </span>
          </div>
        </div>
      </section>
    );

  return null;
}
