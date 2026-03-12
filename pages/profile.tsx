import type { GetServerSidePropsContext } from "next";

// Redirect to new account page structure
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    redirect: {
      destination: "/account",
      permanent: true,
    },
  };
}

export default function ProfilePage() {
  return null;
}
