import type { EmailAdapter, ConfirmationEmailData } from "../config";

export interface LoopsAdapterOptions {
  /** Your Loops API key (from app.loops.so → Settings → API Key) */
  apiKey: string;
  /**
   * The transactional email ID for confirmation emails.
   * Create a transactional email in Loops, then copy the ID here.
   */
  confirmationTransactionalId: string;
  /**
   * The transactional email ID for reminder emails.
   * Can be a single ID (same template for all reminders) or a map
   * keyed by `daysBefore` for different templates per window.
   *
   * @example
   * // Single template for all reminders:
   * reminderTransactionalId: 'cm_abc123'
   *
   * // Different templates per window:
   * reminderTransactionalId: { 7: 'cm_week', 1: 'cm_day' }
   */
  reminderTransactionalId: string | Record<number, string>;
  /**
   * Map show data to Loops data variables used in your template.
   * The keys must match the variable names defined in your Loops template.
   *
   * Defaults to `{ showTitle, showDate, showDateEnd }` if omitted.
   *
   * @example
   * dataVariables: (show) => ({
   *   showTitle: show.title,
   *   showDate: new Date(show.date).toLocaleDateString('en-GB', { dateStyle: 'long' }),
   *   artistName: show.artists[0]?.name ?? '',
   * })
   */
  dataVariables?: (
    show: ConfirmationEmailData,
    context: { type: "confirmation" | "reminder"; daysBefore?: number }
  ) => Record<string, string | number | boolean>;
}

const LOOPS_API = "https://app.loops.so/api/v1/transactional";

/**
 * Email adapter for Loops (https://loops.so).
 *
 * Loops stores your email templates in their dashboard — no code templates
 * needed. Non-technical staff can edit copy and design directly in Loops.
 *
 * Because the Loops Transactional API sends one email per call, this adapter
 * calls it once per recipient. For a show with 2 artists it makes 2 API calls.
 *
 * @example
 * ```ts
 * import { LoopsAdapter } from '@refuge-worldwide/calendar/adapters';
 *
 * const adapter = new LoopsAdapter({
 *   apiKey: process.env.LOOPS_API_KEY,
 *   confirmationTransactionalId: 'cm_abc123',
 *   reminderTransactionalId: { 7: 'cm_week_abc', 1: 'cm_day_abc' },
 *   dataVariables: (show) => ({
 *     showTitle:   show.title,
 *     showDate:    show.date,
 *     showDateEnd: show.dateEnd,
 *   }),
 * });
 * ```
 */
export class LoopsAdapter implements EmailAdapter {
  constructor(private readonly options: LoopsAdapterOptions) {}

  private buildDataVariables(
    show: ConfirmationEmailData,
    context: { type: "confirmation" | "reminder"; daysBefore?: number }
  ): Record<string, string | number | boolean> {
    if (this.options.dataVariables) {
      return this.options.dataVariables(show, context);
    }
    return {
      showTitle: show.title,
      showDate: show.date,
      showDateEnd: show.dateEnd,
    };
  }

  private resolveReminderId(daysBefore: number): string {
    const id = this.options.reminderTransactionalId;
    if (typeof id === "string") return id;
    const match = id[daysBefore];
    if (!match) {
      throw new Error(
        `No Loops transactional ID configured for ${daysBefore}-day reminder. ` +
          `Add an entry to reminderTransactionalId: { ${daysBefore}: 'your-id' }`
      );
    }
    return match;
  }

  private async sendOne(
    email: string,
    transactionalId: string,
    dataVariables: Record<string, string | number | boolean>
  ): Promise<{ id: string }> {
    const res = await fetch(LOOPS_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionalId, email, dataVariables }),
    });

    const json = (await res.json()) as {
      success?: boolean;
      id?: string;
      message?: string;
    };

    if (!res.ok || !json.success) {
      throw new Error(
        `Loops error (${res.status}): ${json.message ?? "Unknown error"}`
      );
    }

    return { id: json.id ?? "" };
  }

  async sendConfirmation(
    to: string[],
    show: ConfirmationEmailData
  ): Promise<{ id: string }> {
    const dataVariables = this.buildDataVariables(show, {
      type: "confirmation",
    });
    const results = await Promise.all(
      to.map((email) =>
        this.sendOne(
          email,
          this.options.confirmationTransactionalId,
          dataVariables
        )
      )
    );
    return results[0] ?? { id: "" };
  }

  async sendReminder(
    to: string[],
    show: ConfirmationEmailData,
    daysBefore: number
  ): Promise<{ id: string }> {
    const transactionalId = this.resolveReminderId(daysBefore);
    const dataVariables = this.buildDataVariables(show, {
      type: "reminder",
      daysBefore,
    });
    const results = await Promise.all(
      to.map((email) => this.sendOne(email, transactionalId, dataVariables))
    );
    return results[0] ?? { id: "" };
  }
}
