import { useRouter } from "next/router";
import { useState } from "react";
import { SupportPicker } from "@/components/supportPicker";

type SettingsContentProps = {
  user: {
    email: string;
    first_name?: string | null;
    subscription_status?: string | null;
  };
};

function Message({
  message,
}: {
  message: { type: "success" | "error"; text: string } | null;
}) {
  if (!message) return null;
  return (
    <p
      className={`text-small ${
        message.type === "error" ? "text-red" : "text-green"
      }`}
    >
      {message.text}
    </p>
  );
}

export function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter();
  const isPaidSupporter =
    user.subscription_status === "active" ||
    user.subscription_status === "past_due";
  const [showSupportPicker, setShowSupportPicker] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [username, setUsername] = useState(user.first_name ?? "");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPortalLoading, setIsPortalLoading] = useState(false);

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingUsername(true);
    setUsernameMessage(null);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setUsernameMessage({
          type: "error",
          text: data?.error ?? "Failed to update username",
        });
      } else {
        setUsernameMessage({ type: "success", text: "Username updated" });
      }
    } catch {
      setUsernameMessage({ type: "error", text: "Failed to update username" });
    } finally {
      setIsSavingUsername(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords don't match" });
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPasswordMessage({
          type: "error",
          text: data?.error ?? "Failed to update password",
        });
      } else {
        setPasswordMessage({ type: "success", text: "Password updated" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleManageSubscription() {
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch {
      alert("Failed to open billing portal");
    } finally {
      setIsPortalLoading(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-black/10 pb-8">
        <h2 className="font-medium text-base mb-4">Profile</h2>

        <form onSubmit={handleSaveUsername} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-2 text-small">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pill-input rounded-none"
              minLength={2}
              maxLength={30}
            />
          </div>

          <div>
            <label className="block mb-2 text-small">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="pill-input rounded-none bg-grey cursor-not-allowed"
            />
            <p className="text-tiny text-black/60 mt-1">
              Contact support to change your email address
            </p>
          </div>

          <Message message={usernameMessage} />

          <button
            type="submit"
            disabled={isSavingUsername}
            className="bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {isSavingUsername ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="border-b border-black/10 pb-8">
        <h2 className="font-medium text-base mb-4">Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block mb-2 text-small">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pill-input rounded-none"
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-small">
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pill-input rounded-none"
              minLength={8}
            />
          </div>

          <Message message={passwordMessage} />

          <button
            type="submit"
            disabled={isSavingPassword || !newPassword}
            className="bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {isSavingPassword ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="border-b border-black/10 pb-8">
        <h2 className="font-medium text-base mb-4">Subscription</h2>

        {isPaidSupporter ? (
          <>
            <p className="text-small mb-4">
              Manage your payment method, change your support amount, or cancel
              your subscription via Stripe.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
              className="bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors disabled:opacity-50"
            >
              {isPortalLoading ? "Loading..." : "Manage Subscription ↗"}
            </button>
          </>
        ) : !showSupportPicker ? (
          <>
            <p className="text-small mb-4">
              You&apos;re not currently a supporter.
            </p>
            <button
              onClick={() => setShowSupportPicker(true)}
              className="bg-black text-white py-3 px-6 text-small hover:bg-black/80 transition-colors"
            >
              Become a Supporter
            </button>
          </>
        ) : (
          <SupportPicker />
        )}
      </div>

      <div>
        <h2 className="font-medium text-base mb-4">Sign Out</h2>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="border-2 border-black py-3 px-6 text-small font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>

      <div className="border-2 border-red p-6">
        <h2 className="font-medium text-base mb-4 text-red">Danger Zone</h2>

        <p className="text-small mb-4">
          Deleting your account will permanently remove all your data, including
          liked shows and subscription history.
        </p>

        <a
          href="mailto:support@refugeworldwide.com?subject=Delete my account"
          className="text-small text-red underline hover:no-underline"
        >
          Request Account Deletion
        </a>
      </div>
    </div>
  );
}
