import type { NextApiRequest, NextApiResponse } from "next";
import type { CalendarConfig } from "../config";
import {
  buildCalendarQuery,
  buildSearchQuery,
  buildArtistSearchQuery,
  executeGraphQL,
  extractItems,
  processShow,
} from "../lib/queries";
import type { RawCalendarShow } from "../types";

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
