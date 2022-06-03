import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { take, skip, filter } = req.query as typeof req.query & {
      take: string;
      skip: string;
      filter: string;
    };

    const shows = await prisma.show.findMany({
      take: Number(take),
      skip: Number(skip),
      include: {
        genres: true,
      },
      orderBy: [{ date: "desc" }, { title: "asc" }],
      ...(filter === "All"
        ? {}
        : {
            where: {
              genres: {
                some: {
                  name: decodeURIComponent(filter),
                },
              },
            },
          }),
    });

    const processed = shows.map((show) => ({
      ...show,
      date: show.date.toString(),
      updatedAt: show.updatedAt.toString(),
      genres: show.genres.map((genre) => genre.name),
    }));

    res.status(200).json(processed);
  } catch (error) {
    res.status(405).json({
      message: (error as Error).message,
    });
  }
}
