import * as React from "react";
import { RRule } from "rrule";
import dayjs from "dayjs";

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const DAYS_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Map dayjs .day() (0=Sun…6=Sat) → index into RRULE_WEEKDAYS (0=Mon…6=Sun)
const DJ_TO_RRULE_IDX = [6, 0, 1, 2, 3, 4, 5];

const RRULE_WEEKDAYS = [
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
  RRule.SU,
];

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Strips DTSTART from an rrule toString(), returning only the RRULE content. */
export function toRRuleString(rule: RRule): string {
  const str = rule.toString();
  const match = str.match(/(?:RRULE:)?(FREQ=.+)/);
  return match ? match[1] : str;
}

/** Generates {start, end} pairs for each occurrence, preserving the show duration. */
export function generateOccurrences(
  rule: RRule,
  startStr: string,
  endStr: string
): Array<{ start: string; end: string }> {
  const durationMinutes = dayjs(endStr).diff(dayjs(startStr), "minute");
  // Safety cap: never generate more than 52 occurrences
  const dates = rule.all((_, i) => i < 52);
  return dates.map((date) => ({
    start: dayjs(date).format("YYYY-MM-DDTHH:mm"),
    end: dayjs(date).add(durationMinutes, "minute").format("YYYY-MM-DDTHH:mm"),
  }));
}

interface RepeatSectionProps {
  /** The current start datetime string from the form ("YYYY-MM-DDTHH:mm"). */
  startDate: string;
  onChange: (rule: RRule | null, displayText?: string) => void;
}

export function RepeatSection({ startDate, onChange }: RepeatSectionProps) {
  const start = dayjs(startDate);
  const startDayIdx = DJ_TO_RRULE_IDX[start.day()]; // 0=Mon…6=Sun
  const nthWeekday = Math.ceil(start.date() / 7);

  const [freq, setFreq] = React.useState<"none" | "weekly" | "monthly">("none");
  const [weekdays, setWeekdays] = React.useState<number[]>([startDayIdx]);
  const [endType, setEndType] = React.useState<"count" | "until">("count");
  const [count, setCount] = React.useState(8);
  const [until, setUntil] = React.useState("");

  // Keep onChange stable so the effect doesn't re-run on parent re-renders
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Reset weekday selection when startDate changes
  const prevDayIdxRef = React.useRef(startDayIdx);
  React.useEffect(() => {
    if (prevDayIdxRef.current !== startDayIdx) {
      setWeekdays([startDayIdx]);
      prevDayIdxRef.current = startDayIdx;
    }
  }, [startDayIdx]);

  React.useEffect(() => {
    if (!startDate || freq === "none") {
      onChangeRef.current(null);
      return;
    }

    const dtstart = dayjs(startDate).toDate();
    const endOpts: { count?: number; until?: Date } =
      endType === "count"
        ? { count }
        : until
        ? { until: dayjs(until).endOf("day").toDate() }
        : { count };

    let rule: RRule;
    let displayText: string;
    if (freq === "weekly") {
      rule = new RRule({
        freq: RRule.WEEKLY,
        dtstart,
        byweekday: weekdays.map((i) => RRULE_WEEKDAYS[i]),
        ...endOpts,
      });
      const dayNames = [...weekdays]
        .sort((a, b) => a - b)
        .map((d) => DAYS_FULL[d])
        .join(", ");
      displayText = `every week on ${dayNames}`;
    } else {
      // monthly — always nth weekday of the month
      rule = new RRule({
        freq: RRule.MONTHLY,
        dtstart,
        byweekday: [RRULE_WEEKDAYS[startDayIdx]],
        bysetpos: [nthWeekday],
        ...endOpts,
      });
      displayText = `${ordinal(nthWeekday)} ${
        DAYS_FULL[startDayIdx]
      } of each month`;
    }

    onChangeRef.current(rule, displayText);
  }, [
    freq,
    weekdays,
    endType,
    count,
    until,
    startDate,
    startDayIdx,
    nthWeekday,
    start,
  ]);

  const toggleWeekday = (i: number) => {
    setWeekdays((prev) =>
      prev.includes(i)
        ? prev.length > 1
          ? prev.filter((d) => d !== i)
          : prev
        : [...prev, i].sort((a, b) => a - b)
    );
  };

  if (!startDate) return null;

  // Build display-only rule (no dtstart) for toText() and occurrence count
  const displayOpts: { count?: number; until?: Date } =
    endType === "count"
      ? { count }
      : until
      ? { until: dayjs(until).endOf("day").toDate() }
      : { count };

  let displayRule: RRule | null = null;
  try {
    if (freq === "weekly") {
      displayRule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: weekdays.map((i) => RRULE_WEEKDAYS[i]),
        ...displayOpts,
      });
    } else if (freq === "monthly") {
      displayRule = new RRule({
        freq: RRule.MONTHLY,
        byweekday: [RRULE_WEEKDAYS[startDayIdx]],
        bysetpos: [nthWeekday],
        ...displayOpts,
      });
    }
  } catch {
    // invalid rule state during input
  }

  const occurrenceCount = displayRule
    ? displayRule.all((_, i) => i < 52).length
    : 0;

  return (
    <fieldset className="mb-4">
      <legend>Repeat</legend>

      <select
        value={freq}
        onChange={(e) => setFreq(e.target.value as typeof freq)}
        className="pill-input"
      >
        <option value="none">None</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      {freq !== "none" && (
        <div className="mt-2 space-y-2 text-sm">
          {/* Weekly: day-of-week picker */}
          {freq === "weekly" && (
            <div>
              <label className="text-small uppercase tracking-wide opacity-60 mb-2">
                Repeat on
              </label>
              <div className="flex gap-1">
                {DAYS_SHORT.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={DAYS_FULL[i]}
                    onClick={() => toggleWeekday(i)}
                    className={`w-6 h-6 rounded-full border text-small font-medium transition-colors${
                      weekdays.includes(i)
                        ? " bg-black text-white border-black"
                        : " bg-white text-black border-black"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: always nth weekday of the month */}
          {freq === "monthly" && (
            <p className="opacity-60">
              On the {ordinal(nthWeekday)} {DAYS_FULL[startDayIdx]} of each
              month
            </p>
          )}

          {/* End condition */}
          <div className="space-y-1 text-small">
            <label className="flex items-center gap-2 cursor-pointer font-normal">
              <input
                type="radio"
                name="repeat-end"
                checked={endType === "count"}
                onChange={() => setEndType("count")}
              />
              After
              <input
                type="number"
                min={1}
                max={52}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(52, Number(e.target.value))))
                }
                disabled={endType !== "count"}
                className="border-2 border-black rounded-full px-2 py-1 w-12 text-center font-light bg-white disabled:opacity-40"
              />
              occurrences
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-normal">
              <input
                type="radio"
                name="repeat-end"
                checked={endType === "until"}
                onChange={() => setEndType("until")}
              />
              On
              <input
                type="date"
                value={until}
                min={startDate.slice(0, 10)}
                onChange={(e) => setUntil(e.target.value)}
                disabled={endType !== "until"}
                className="border-2 border-black rounded-full px-3 py-1 font-light bg-white disabled:opacity-40"
              />
            </label>
          </div>

          {/* Plain-English preview */}
          {displayRule && (
            <p className="text-xxs italic opacity-60">
              {displayRule.toText()} — will create{" "}
              <strong className="not-italic">{occurrenceCount}</strong> show
              {occurrenceCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
