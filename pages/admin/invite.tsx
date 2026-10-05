import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import { requireAdminPage } from "@/lib/directus/staff";
import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";

type InviteRole = "friend" | "staff";

export default function InvitePage() {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<InviteRole>("friend");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const parsedEmails = Array.from(
    new Set(
      emails
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean)
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: parsedEmails, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to send invite",
        });
      } else {
        const parts = [];
        if (data.sent?.length) parts.push(`Invited: ${data.sent.join(", ")}`);
        if (data.failed?.length)
          parts.push(`Failed: ${data.failed.join(", ")}`);
        setMessage({
          type: data.failed?.length ? "error" : "success",
          text: parts.join(". "),
        });
        if (!data.failed?.length) setEmails("");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send invite" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Layout>
      <PageMeta title="Invite | Refuge Worldwide" path="admin/invite/" />

      <div className="min-h-[75vh] bg-white p-4 sm:p-8">
        <div className="max-w-md mx-auto">
          <h1 className="font-sans font-normal text-large mb-8">
            Invite a Friend or Staff member
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="emails" className="block mb-2 text-small">
                Emails (one per line, or comma-separated)
              </label>
              <textarea
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="pill-input rounded-none"
                rows={5}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block mb-2 text-small">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as InviteRole)}
                className="pill-input rounded-none"
              >
                <option value="friend">Friend</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            {message && (
              <p
                className={`text-small ${
                  message.type === "error" ? "text-red" : "text-green"
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSending || parsedEmails.length === 0}
              className="bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {isSending
                ? "Sending..."
                : `Send Invite${parsedEmails.length > 1 ? "s" : ""}`}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAdminPage(context);
}
