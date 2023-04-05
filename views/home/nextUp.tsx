import { useRef, useState, useEffect } from "react";
import useSchedule from "../../hooks/useSchedule";
import Pill from "../../components/pill";
import useMarquee from "../../hooks/useMarquee";
import { NextUpSection } from "../../types/shared";
import Link from "next/link";
import LocalTime from "../../components/localTime";
import Marquee from "../../components/marquee";

export default function NextUp() {
  const { scheduleData, isLoading } = useSchedule();
  // const shouldShowBanner = scheduleData.nextUp;

  const bgOptions = ["bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-red"];

  const bgColour = bgOptions[Math.floor(Math.random() * bgOptions.length)];

  return (
    <section className={`${bgColour} border-t-2 border-b-2`}>
      <div className="flex items-center">
        <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-r-2">
          <Link href="/schedule">
            <Pill outline={true} size="medium" hover={true}>
              <h2 className="whitespace-nowrap">
                Next <span className="hidden md:inline">Up</span>
              </h2>
            </Pill>
          </Link>
        </div>
        <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 overflow-hidden">
          {isLoading ? (
            <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-2 ml-6 animate-pulse">
              <p className="font-medium opacity-70" key="loading">
                Loading
              </p>
            </span>
          ) : (
            <Marquee
              speed={0.5}
              key={scheduleData.nextUp[0].title}
              text={
                <span className="h-10 flex items-center space-x-2 whitespace-nowrap px-2">
                  {scheduleData.nextUp.map((show) => (
                    <p className="font-medium" key={show.title}>
                      <LocalTime dateTime={show.date} /> {show.title} &#47;&#47;{" "}
                    </p>
                  ))}
                </span>
              }
            ></Marquee>
          )}
        </div>
        {/* <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-l-2 self-stretch items-center flex">
            <Link href="/schedule">
              <h2 className="hidden lg:block whitespace-nowrap underline font-sans font-medium py-1.5">
                Schedule
              </h2>
              <span className="sr-only lg:hidden">Schedule</span>
              <Cross
                className="rotate-45 lg:hidden"
                strokeWidth="3"
                size={15}
              />
            </Link>
          </div> */}
      </div>
    </section>
  );

  // return null;
}
