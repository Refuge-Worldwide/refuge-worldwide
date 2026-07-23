import Layout from "../components/layout";
import PageMeta from "../components/seo/page";
import { SetPasswordForm } from "@/components/setPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Layout>
      <PageMeta
        title="Reset password | Refuge Worldwide"
        path="reset-password/"
      />
      <SetPasswordForm
        apiPath="/api/auth/reset-password"
        heading="Set a new password"
        successMessage="Your password has been updated."
      />
    </Layout>
  );
}
