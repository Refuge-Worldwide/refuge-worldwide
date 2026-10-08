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
        heading="You've been invited to become a Refuge Worldwide supporter"
        intro="Sign up below for your free supporter account."
        successMessage="Your account is ready — sign in to get started."
        includeUsername
        boxClassName="max-w-xl"
      />
    </Layout>
  );
}
