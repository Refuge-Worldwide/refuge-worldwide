import { NextApiHandler } from "next";
import createClient from "@/lib/supabase/api";

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const supabase = createClient(req, res);
  await supabase.auth.signOut();
  res.redirect("/signin");
};

export default handler;
