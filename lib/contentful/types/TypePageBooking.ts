import * as Contentful from "contentful";

export interface TypePageBookingFields {
  internal: Contentful.EntryFields.Symbol;
  bookingPassword?: Contentful.EntryFields.Symbol;
}

export type TypePageBooking = Contentful.Entry<TypePageBookingFields>;
