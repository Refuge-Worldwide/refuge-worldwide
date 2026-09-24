import Layout from "../../components/layout";
import PageMeta from "../../components/seo/page";
import { SetPasswordForm } from "@/components/setPasswordForm";

export default function AcceptInvitePage() {
  return (
    <Layout>
      <PageMeta
        title="Set your password | Refuge Worldwide"
        path="account/accept-invite/"
      />
      <SetPasswordForm
        apiPath="/api/auth/accept-invite"
        heading="Welcome to Refuge Worldwide"
        successMessage="Your account is ready — sign in to manage your support."
        includeUsername
      />
    </Layout>
  );
}
