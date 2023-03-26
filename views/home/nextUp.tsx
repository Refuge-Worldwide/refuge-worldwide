import { useRef, useState, useEffect } from "react";
import useSchedule from "../../hooks/useSchedule";
import Pill from "../../components/pill";
import useMarquee from "../../hooks/useMarquee";
import { NextUpSection } from "../../types/shared";
import { Arrow } from "../../icons/arrow";
import Link from "next/link";
import LocalTime from "../../components/localTime";

export default function NextUp({ content }: NextUpSection) {
  const { scheduleData, isLoading } = useSchedule();
  const shouldShowBanner = content && content.json;

  const ref = useRef<HTMLDivElement>();
  useMarquee(ref, { speed: 0.75 });

  const bgOptions = ["bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-red"];

  const bgColour = bgOptions[Math.floor(Math.random() * bgOptions.length)];

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
                {!isLoading && (
                  <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-2">
                    {scheduleData.nextUp.map((show) => (
                      <p className="font-medium" key={show.title}>
                        <LocalTime dateTime={show.date} /> {show.title}{" "}
                        &#47;&#47;{" "}
                      </p>
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );

  return null;
}
