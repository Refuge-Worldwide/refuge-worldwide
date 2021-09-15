import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { Feed } from "feed";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getNewsPage } from "../../lib/contentful/pages/news";
import { getRSSFeed } from "../../lib/contentful/pages/rss";

type RSSFeeds = "feed.json" | "feed.xml" | "atom.xml";

type ContentTypeHeader = "application/json" | "text/xml";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ feed: RSSFeeds }>
): Promise<GetServerSidePropsResult<{}>> {
  if (context && context.res) {
    const { res, params } = context;

    if (
      params.feed !== "atom.xml" &&
      params.feed !== "feed.xml" &&
      params.feed !== "feed.json"
    ) {
      return {
        notFound: true,
      };
    }

    const articles = await getRSSFeed();

    const siteURL = `https://refugeworldwide.com`;

    const date = new Date();

    const author = {
      name: "Refuge Worldwide",
      email: "hello@refugeworldwide.com",
      link: "https://twitter.com/RefugeWorldwide",
    };

    const feed = new Feed({
      title: "Refuge Worldwide News",
      id: siteURL,
      link: siteURL,
      image: `${siteURL}/android-chrome-512x512.png`,
      favicon: `${siteURL}/favicon-32x32.png`,
      copyright: `All rights reserved ${date.getFullYear()}, Refuge Worldwide`,
      updated: date,
      feedLinks: {
        rss2: `${siteURL}/rss/feed.xml`,
        json: `${siteURL}/rss/feed.json`,
        atom: `${siteURL}/rss/atom.xml`,
      },
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

    let writeChunk: string;
    let contentTypeHeader: ContentTypeHeader = "text/xml";

    switch (true) {
      case params.feed === "feed.json":
        writeChunk = feed.json1();
        contentTypeHeader = "application/json";
        break;

      case params.feed === "atom.xml":
        writeChunk = feed.atom1();
        break;

      default:
        writeChunk = feed.rss2();
        break;
    }

    res.setHeader("Content-Type", contentTypeHeader);

    res.write(writeChunk);

    res.end();
  }

  return {
    props: {},
  };
}

export default function RSSFeed() {}
