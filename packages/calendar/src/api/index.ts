import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { NextApiRequest, NextApiResponse } from "next";
import type { CalendarConfig, ConfirmationEmailData } from "../config";
import {
  buildCalendarQuery,
  buildSearchQuery,
  buildArtistSearchQuery,
  executeGraphQL,
  extractItems,
  processShow,
} from "../lib/queries";
import type { RawCalendarShow, ShowFormValues } from "../types";

dayjs.extend(utc);

/**
 * GET /api/admin/calendar?start=...&end=...
 *
 * ```ts
 * // pages/api/admin/calendar.ts
 * import { calendarHandler } from '@refuge-worldwide/contentful-calendar/api';
 * import config from '../../../contentful-calendar.config';
 * export default calendarHandler(config);
 * ```
 */
export function calendarHandler(config: CalendarConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { start, end } = req.query as { start?: string; end?: string };

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Missing start or end query params" });
    }

    try {
      const query = buildCalendarQuery(config);
      const data = await executeGraphQL(query, config, {
        preview: true,
        variables: { start, end, preview: true },
      });

      const rawShows = extractItems<RawCalendarShow>(
        data,
        config.contentTypes.show
      );
      const processed = rawShows.map((show) => processShow(show, config));

      return res
        .status(200)
        .setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=20")
        .json({ processed });
    } catch (error) {
      console.error("[calendarHandler]", error);
      return res.status(400).json({ message: (error as Error).message });
    }
  };
}

/**
 * Unified search handler for shows and artists.
 *
 * GET /api/admin/search?query=...               → CalendarShow[]
 * GET /api/admin/search?query=...&type=artists  → { value, label, email }[]
 *
 * ```ts
 * // pages/api/admin/search.ts
 * import { calendarSearchHandler } from '@refuge-worldwide/contentful-calendar/api';
 * import config from '../../../contentful-calendar.config';
 * export default calendarSearchHandler(config);
 * ```
 */
export function calendarSearchHandler(config: CalendarConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { query = "", type } = req.query as { query?: string; type?: string };

    try {
      if (type === "artists") {
        const gql = buildArtistSearchQuery(config);
        const data = await executeGraphQL(gql, config, {
          preview: true,
          variables: { query, limit: 30, preview: true },
        });

        const key = `${config.contentTypes.artist}Collection`;
        const collection = data[key] as {
          items?: Array<{
            sys: { id: string };
            name: string;
            email?: string[];
          }>;
        };
        const items = (collection?.items ?? []).map((a) => ({
          value: a.sys.id,
          label: a.name,
          email: a.email ?? [],
        }));

        return res
          .status(200)
          .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
          .json(items);
      }

      // Show search
      const gql = buildSearchQuery(config);
      const data = await executeGraphQL(gql, config, {
        preview: true,
        variables: { query, preview: true },
      });

      const rawShows = extractItems<RawCalendarShow>(
        data,
        config.contentTypes.show
      );
      const items = rawShows.map((show) => processShow(show, config));

      return res
        .status(200)
        .setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate=59")
        .json(items);
    } catch (error) {
      console.error("[calendarSearchHandler]", error);
      return res.status(400).json({ message: (error as Error).message });
    }
  };
}

/**
 * POST /api/admin/confirmation-email
 *
 * Sends a confirmation email to all artists on a show when its status
 * transitions to Confirmed. Requires `email` to be configured in CalendarConfig.
 *
 * The CalendarWidget calls this automatically after a show is saved with
 * Confirmed status. Wire it up once:
 *
 * ```ts
 * // pages/api/admin/confirmation-email.ts
 * import { confirmationEmailHandler } from '@refuge-worldwide/contentful-calendar/api';
 * import config from '../../../contentful-calendar.config';
 * export default confirmationEmailHandler(config);
 * ```
 */
export function confirmationEmailHandler(config: CalendarConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!config.email) {
      return res
        .status(501)
        .json({ message: "No email adapter configured in CalendarConfig" });
    }

    try {
      const values = req.body as ShowFormValues;

      const to = (values.artists ?? []).flatMap((a) => a.email ?? []);
      if (!to.length) {
        return res
          .status(400)
          .json({ message: "No artist email addresses found on this show" });
      }

      const showData: ConfirmationEmailData = {
        id: values.id ?? "",
        title: values.title ?? "",
        date: values.start,
        dateEnd: values.end,
        artists: (values.artists ?? []).map((a) => ({
          name: a.label,
          email: a.email ?? [],
        })),
      };

      const result = await config.email.adapter.sendConfirmation(to, showData);
      return res.status(200).json(result);
    } catch (error) {
      console.error("[confirmationEmailHandler]", error);
      return res.status(400).json({ message: (error as Error).message });
    }
  };
}

/**
 * GET /api/admin/reminder-emails
 *
 * Sends reminder emails for upcoming confirmed shows. Designed to be called
 * by a cron job (e.g. Vercel Cron at midnight daily).
 *
 * Requires `email` and `reminders` to be configured in CalendarConfig.
 *
 * ```ts
 * // pages/api/admin/reminder-emails.ts
 * import { reminderHandler } from '@refuge-worldwide/contentful-calendar/api';
 * import config from '../../../contentful-calendar.config';
 * export default reminderHandler(config);
 * ```
 *
 * Vercel Cron (vercel.json):
 * ```json
 * { "crons": [{ "path": "/api/admin/reminder-emails", "schedule": "0 9 * * *" }] }
 * ```
 *
 * ⚠️  Idempotency: this handler has no built-in deduplication — running it
 * twice on the same day will send duplicate reminders. Prevent this by either:
 * - Calling it exactly once per day via cron
 * - Using an email provider that handles deduplication natively (e.g. Loops)
 */
export function reminderHandler(config: CalendarConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (!config.email) {
      return res
        .status(501)
        .json({ message: "No email adapter configured in CalendarConfig" });
    }

    if (!config.reminders?.length) {
      return res
        .status(200)
        .json({ message: "No reminders configured", sent: 0 });
    }

    try {
      const now = dayjs.utc();
      const maxDays = Math.max(...config.reminders.map((r) => r.daysBefore));

      // Fetch all shows starting between now and the furthest reminder window
      const start = now.toISOString();
      const end = now.add(maxDays, "day").endOf("day").toISOString();

      const query = buildCalendarQuery(config);
      const data = await executeGraphQL(query, config, {
        preview: false,
        variables: { start, end },
      });

      const rawShows = extractItems<RawCalendarShow>(
        data,
        config.contentTypes.show
      );

      // Only process confirmed shows
      const confirmedShows = rawShows.filter(
        (s) => s.status === config.statusValues.confirmed
      );

      const results: Array<{
        showId: string;
        daysBefore: number;
        result: unknown;
      }> = [];

      for (const reminder of config.reminders) {
        const targetDay = now
          .add(reminder.daysBefore, "day")
          .format("YYYY-MM-DD");

        const dueShows = confirmedShows.filter((show) => {
          if (!show.date) return false;
          return dayjs.utc(show.date).format("YYYY-MM-DD") === targetDay;
        });

        for (const show of dueShows) {
          const artists = (show.artists?.items ?? []).map((a) => ({
            name: a.name,
            email: a.email ?? [],
          }));

          const to = artists.flatMap((a) => a.email);
          if (!to.length) continue;

          const showData: ConfirmationEmailData = {
            id: show.sys.id,
            title: show.title ?? "",
            date: show.date,
            dateEnd: show.dateEnd,
            artists,
          };

          const result = await config.email!.adapter.sendReminder(
            to,
            showData,
            reminder.daysBefore
          );
          results.push({
            showId: show.sys.id,
            daysBefore: reminder.daysBefore,
            result,
          });
        }
      }

      return res.status(200).json({ sent: results.length, results });
    } catch (error) {
      console.error("[reminderHandler]", error);
      return res.status(400).json({ message: (error as Error).message });
    }
  };
}
