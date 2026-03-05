import { describe, it, expect } from "vitest";
import { RRule } from "rrule";
import dayjs from "dayjs";
import {
  toRRuleString,
  generateOccurrences,
} from "../components/RepeatSection";

// ── toRRuleString ─────────────────────────────────────────────────────────────

describe("toRRuleString", () => {
  it("strips DTSTART and returns only the RRULE content for a weekly rule", () => {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date("2026-03-10T10:00:00Z"),
      byweekday: [RRule.MO, RRule.WE],
      count: 4,
    });
    const result = toRRuleString(rule);
    expect(result).not.toContain("DTSTART");
    expect(result).toMatch(/^FREQ=WEEKLY/);
    expect(result).toContain("COUNT=4");
  });

  it("strips DTSTART and returns only the RRULE content for a monthly rule", () => {
    const rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart: new Date("2026-03-10T10:00:00Z"),
      byweekday: [RRule.TU],
      bysetpos: [2],
      count: 3,
    });
    const result = toRRuleString(rule);
    expect(result).not.toContain("DTSTART");
    expect(result).toMatch(/^FREQ=MONTHLY/);
  });
});

// ── generateOccurrences ───────────────────────────────────────────────────────

describe("generateOccurrences", () => {
  it("generates the correct dates for a weekly rule", () => {
    // Every Monday for 3 weeks starting 2026-03-09 (a Monday)
    // Use local Date (no UTC) to match how the component creates dtstart via dayjs(startDate).toDate()
    const dtstart = dayjs("2026-03-09T18:00").toDate();
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart,
      byweekday: [RRule.MO],
      count: 3,
    });

    const occurrences = generateOccurrences(
      rule,
      "2026-03-09T18:00",
      "2026-03-09T20:00"
    );

    expect(occurrences).toHaveLength(3);
    expect(occurrences[0].start).toBe("2026-03-09T18:00");
    expect(occurrences[1].start).toBe("2026-03-16T18:00");
    expect(occurrences[2].start).toBe("2026-03-23T18:00");
  });

  it("preserves the show duration across all occurrences", () => {
    // 90-minute show, 4 occurrences
    const dtstart = dayjs("2026-03-09T20:00").toDate();
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart,
      byweekday: [RRule.MO],
      count: 4,
    });

    const occurrences = generateOccurrences(
      rule,
      "2026-03-09T20:00",
      "2026-03-09T21:30" // 90 minutes
    );

    expect(occurrences).toHaveLength(4);
    for (const { start, end } of occurrences) {
      const durationMinutes = dayjs(end).diff(dayjs(start), "minute");
      expect(durationMinutes).toBe(90);
    }
  });

  it("generates the correct date for a monthly nth-weekday rule", () => {
    // 2nd Tuesday of each month, starting 2026-03-10 (2nd Tuesday of March 2026)
    const dtstart = dayjs("2026-03-10T18:00").toDate();
    const rule = new RRule({
      freq: RRule.MONTHLY,
      dtstart,
      byweekday: [RRule.TU],
      bysetpos: [2],
      count: 3,
    });

    const occurrences = generateOccurrences(
      rule,
      "2026-03-10T18:00",
      "2026-03-10T20:00"
    );

    expect(occurrences).toHaveLength(3);
    // 2nd Tuesday of March 2026 = 10 Mar
    expect(occurrences[0].start).toBe("2026-03-10T18:00");
    // 2nd Tuesday of April 2026 = 14 Apr
    expect(occurrences[1].start).toBe("2026-04-14T18:00");
    // 2nd Tuesday of May 2026 = 12 May
    expect(occurrences[2].start).toBe("2026-05-12T18:00");
  });

  it("caps occurrences at 52 regardless of the rule count", () => {
    const dtstart = dayjs("2026-03-09T18:00").toDate();
    const rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart,
      byweekday: [RRule.MO],
      count: 200, // deliberately over the cap
    });

    const occurrences = generateOccurrences(
      rule,
      "2026-03-09T18:00",
      "2026-03-09T19:00"
    );

    expect(occurrences.length).toBeLessThanOrEqual(52);
  });
});
