import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Pill from "../../components/pill";
import useMarquee3k from "../../hooks/useMarquee3k";
import { NextUpSection } from "../../lib/api";

export default function NextUp({ content, header }: NextUpSection) {
  const shouldShowBanner = content.json && typeof header === "string";

  useMarquee3k();

  if (shouldShowBanner)
    return (
      <section className="bg-orange border-t-2 border-b-2">
        <div className="flex items-center">
          <div className="hidden sm:block pt-4 pb-4 px-4 md:px-8 border-r-2">
            <Pill size="medium">
              <h2 className="whitespace-nowrap">{header}</h2>
            </Pill>
          </div>
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 overflow-hidden">
            <div className="marquee3k" data-speed="0.75">
              <div>
                <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-2">
                  {documentToReactComponents(content?.json)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );

  return null;
}
