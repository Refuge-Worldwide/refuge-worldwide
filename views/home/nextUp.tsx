import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { useRef, useState, useEffect } from "react";

import Pill from "../../components/pill";
import useMarquee from "../../hooks/useMarquee";
import { NextUpSection } from "../../types/shared";
import { Arrow } from "../../icons/arrow";
import Link from "next/link";

export default function NextUp({ content }: NextUpSection) {
  const shouldShowBanner = content && content.json;
  const [bgColour, setBgColour] = useState("bg-orange");

  const ref = useRef<HTMLDivElement>();
  useMarquee(ref, { speed: 0.75 });

  const bgOptions = ["bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-red"];

  useEffect(() => {
    setBgColour(bgOptions[Math.floor(Math.random() * bgOptions.length)]);
  });

  if (shouldShowBanner)
    return (
      <section className={`${bgColour} border-t-2 border-b-2`}>
        <div className="flex items-center">
          <Link
            href="/radio/schedule"
            className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-r-2"
          >
            <h2 className=" pt-1 pb-1 whitespace-nowrap flex gap-3 items-center">
              <span className=" font-sans font-medium underline">
                Next <span className="hidden md:inline">Up</span>
              </span>
              <Arrow />
            </h2>
          </Link>
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 overflow-hidden">
            <div ref={ref}>
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
