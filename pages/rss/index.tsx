import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { Author, Feed } from "feed";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getRSSFeed } from "../../lib/contentful/pages/rss";

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  if (context && context.res) {
    const { res } = context;

    const articles = await getRSSFeed();

    const siteURL = `https://refugeworldwide.com`;

    const date = new Date();

    const author: Author = {
      name: "Refuge Worldwide",
      email: "hello@refugeworldwide.com",
      link: "https://twitter.com/RefugeWorldwide",
    };

    const feed = new Feed({
      title: "Refuge Worldwide News",
      id: siteURL,
      link: siteURL,
      language: "en",
      image: `${siteURL}/android-chrome-512x512.png`,
      favicon: `${siteURL}/favicon-32x32.png`,
      copyright: `All rights reserved ${date.getFullYear()}, Refuge Worldwide`,
      updated: date,
      author,
    });

    articles.forEach((article) => {
      const url = `${siteURL}/news/${article.slug}`;

      feed.addItem({
        title: article.title,
        id: url,
        link: url,
        description: article?.subtitle ?? undefined,
        content: documentToPlainTextString(article.content.json),
        author: [{ name: article?.author?.name ?? "Staff" }],
        image: article?.coverImage?.url ?? undefined,
        date: new Date(article.date),
      });
    });

    res.setHeader("Content-Type", "text/xml");

    res.write(feed.rss2());

    res.end();
  }

  return {
    props: {},
  };
}

export default function RSSFeed() {}
