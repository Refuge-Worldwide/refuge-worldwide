import { graphql } from "..";
import { BookingsPageData } from "../../../types/shared";
import { extractPage } from "../../../util";

export async function getBookingsPage(preview: boolean) {
  const BookingPageQuery = /* GraphQL */ `
    query BookingPageQuery($preview: Boolean) {
      pageBooking(id: "5ApzlspIzqeUmURGvpTCug", preview: $preview) {
        bookingPassword
      }
    }
  `;

  const data = await graphql(BookingPageQuery, {
    variables: { preview },
    preview,
  });

  return extractPage<BookingsPageData>(data, "pageBooking");
}
