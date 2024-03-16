import useSchedule from "../../hooks/useSchedule";
import Pill from "../../components/pill";
import Link from "next/link";
import LocalTime from "../../components/localTime";
import Marquee from "../../components/marquee";
import { Cross } from "../../icons/cross";

export default function NextUp() {
  const { scheduleData, isLoading, error } = useSchedule();
  // const shouldShowBanner = scheduleData.nextUp;

  const bgOptions = ["bg-orange", "bg-purple", "bg-pink", "bg-green", "bg-red"];

  const bgColour = bgOptions[Math.floor(Math.random() * bgOptions.length)];

  if (
    (!isLoading && !scheduleData?.nextUp[0]) ||
    error ||
    scheduleData?.liveNow.isMixedFeelings
  )
    return null;
  else
    return (
      <section className={`${bgColour} border-t-2 border-b-2`}>
        <div className="flex items-center">
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-r-2">
            <Pill outline={true} size="medium">
              <h2 className="whitespace-nowrap">
                Next <span className="hidden md:inline">Up</span>
              </h2>
            </Pill>
          </div>
          <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 overflow-hidden">
            {isLoading ? (
              <div className="h-6 sm:h-9 w-56 flex px-2 ml-6 bg-black/25">
                <p className="hidden">Loading</p>
              </div>
            ) : (
              <Marquee
                speed={0.5}
                key={scheduleData.nextUp[0].title}
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
          {!isLoading && (
            <div className="pt-2 pb-2 sm:pt-4 sm:pb-4 px-4 md:px-8 border-l-2 self-stretch items-center flex">
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
            </div>
          )}
        </div>
      </section>
    );
}
