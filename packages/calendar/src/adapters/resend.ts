import type { EmailAdapter, ConfirmationEmailData } from "../config";

/**
 * Duck-typed interface for the Resend client.
 * Accepts the real `Resend` instance from the `resend` npm package
 * without importing it as a dependency.
 */
interface ResendClient {
  emails: {
    send(params: {
      from: string;
      to: string | string[];
      subject: string;
      html?: string;
      text?: string;
      /** React Email component — type as `unknown` to avoid importing React here */
      react?: unknown;
      reply_to?: string | string[];
    }): Promise<{
      data: { id: string } | null;
      error: { message: string; name: string } | null;
    }>;
  };
}

export interface ResendEmailContent {
  subject: string;
  /** Rendered HTML string */
  html?: string;
  /** Plain-text fallback */
  text?: string;
  /**
   * React Email component (requires `react` and `@react-email/render` in your app).
   * Either `html` or `react` must be provided.
   */
  react?: unknown;
}

export interface ResendAdapterOptions {
  /**
   * An initialised Resend client from the `resend` npm package.
   *
   * ```ts
   * import { Resend } from 'resend';
   * const client = new Resend(process.env.RESEND_API_KEY);
   * ```
   */
  client: ResendClient;
  /** The `from` address shown to recipients, e.g. `"Radio Station <noreply@station.com>"` */
  from: string;
  /** Optional reply-to address(es) */
  replyTo?: string | string[];
  /**
   * Build the email content for a confirmation email.
   * Return `subject` + either `html`, `text`, or `react`.
   */
  buildConfirmation(show: ConfirmationEmailData): ResendEmailContent;
  /**
   * Build the email content for a reminder email.
   * Return `subject` + either `html`, `text`, or `react`.
   *
   * @param daysBefore How many days before the show this reminder is for.
   */
  buildReminder(
    show: ConfirmationEmailData,
    daysBefore: number
  ): ResendEmailContent;
}

/**
 * Email adapter for Resend (https://resend.com).
 *
 * Bring your own `Resend` client and template functions — the adapter handles
 * the API call. Templates can be plain HTML strings or React Email components.
 *
 * @example
 * ```ts
 * import { Resend } from 'resend';
 * import { ResendAdapter } from '@refuge-worldwide/calendar/adapters';
 *
 * const adapter = new ResendAdapter({
 *   client: new Resend(process.env.RESEND_API_KEY),
 *   from: 'Radio Station <noreply@station.com>',
 *   replyTo: 'bookings@station.com',
 *   buildConfirmation: (show) => ({
 *     subject: `Show confirmed: ${show.title}`,
 *     html: `<p>Your show on ${show.date} is confirmed.</p>`,
 *   }),
 *   buildReminder: (show, daysBefore) => ({
 *     subject: `${daysBefore} days until your show`,
 *     html: `<p>Reminder: your show "${show.title}" is in ${daysBefore} days.</p>`,
 *   }),
 * });
 * ```
 */
export class ResendAdapter implements EmailAdapter {
  constructor(private readonly options: ResendAdapterOptions) {}

  async sendConfirmation(
    to: string[],
    show: ConfirmationEmailData
  ): Promise<{ id: string }> {
    const content = this.options.buildConfirmation(show);
    const { data, error } = await this.options.client.emails.send({
      from: this.options.from,
      to,
      reply_to: this.options.replyTo,
      ...content,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return { id: data?.id ?? "" };
  }

  async sendReminder(
    to: string[],
    show: ConfirmationEmailData,
    daysBefore: number
  ): Promise<{ id: string }> {
    const content = this.options.buildReminder(show, daysBefore);
    const { data, error } = await this.options.client.emails.send({
      from: this.options.from,
      to,
      reply_to: this.options.replyTo,
      ...content,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return { id: data?.id ?? "" };
  }
}
