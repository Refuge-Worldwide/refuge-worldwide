import { useRef, useState, useEffect } from "react";
import useSchedule from "../../hooks/useSchedule";
import Pill from "../../components/pill";
import useMarquee from "../../hooks/useMarquee";
import { NextUpSection } from "../../types/shared";
import { Arrow } from "../../icons/arrow";
import Link from "next/link";
import LocalTime from "../../components/localTime";
import Marquee from "../../components/marquee";

export default function NextUp({ content }: NextUpSection) {
  const { scheduleData, isLoading } = useSchedule();
  const shouldShowBanner = content && content.json;

  const bgOptions = ["bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-red"];

  const bgColour = bgOptions[Math.floor(Math.random() * bgOptions.length)];

  if (shouldShowBanner)
    return (
      <section className={`${bgColour} border-t-2 border-b-2`}>
        <div className="flex items-center">
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-r-2">
            <Link href="/radio/schedule">
              <Pill outline size="medium">
                <h2 className="whitespace-nowrap flex gap-3 items-center -mr-1">
                  <span>
                    Next <span className="hidden md:inline">Up</span>
                  </span>
                  <Arrow />
                </h2>
              </Pill>
            </Link>
          </div>
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 overflow-hidden">
            {!isLoading && (
              <Marquee
                speed={0.75}
                text={
                  <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-2">
                    {scheduleData.nextUp.map((show) => (
                      <p className="font-medium" key={show.title}>
                        <LocalTime dateTime={show.date} /> {show.title}{" "}
                        &#47;&#47;{" "}
                      </p>
                    ))}
                  </span>
                }
              ></Marquee>
            )}
          </div>
        </div>
      </section>
    );

  return null;
}
