import type { NextApiRequest, NextApiResponse } from "next";
import { directusUrl } from "@/lib/directus/session";
import { requireSupporterToken } from "@/lib/directus/supporterAccess";

type DiscountCode = { label?: string; code: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = await requireSupporterToken(req, res);
  if (!token) return;

  try {
    const response = await fetch(
      `${directusUrl}/items/settings?fields=discount_codes`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch discount codes");
    }
    const { data } = await response.json();
    const discountCodes: DiscountCode[] = data?.discount_codes ?? [];
    return res.status(200).json({ discountCodes });
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch discount codes",
    });
  }
}
