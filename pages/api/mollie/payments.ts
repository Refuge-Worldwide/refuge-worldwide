import type { NextApiRequest, NextApiResponse } from "next";
import { mollie } from "@/lib/mollie/config";
import { supabaseAdmin } from "@/lib/mollie/admin";
import createClient from "@/lib/supabase/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get the user's Mollie customer ID from Supabase
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("mollie_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!customer?.mollie_customer_id) {
      return res.status(200).json({ payments: [] });
    }

    // Fetch payments from Mollie for this customer
    const payments = await mollie.customerPayments.page({
      customerId: customer.mollie_customer_id,
    });

    // Transform to a simpler format for the frontend
    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      description: payment.description,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      method: payment.method,
      // Mollie doesn't provide invoice URLs directly for payments
      // Invoices are separate and only available for certain payment types
    }));

    return res.status(200).json({ payments: formattedPayments });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch payments",
    });
  }
}
