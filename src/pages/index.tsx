import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: "/node-runtime", permanent: false } };
};

export default function Home() {
  return <></>;
}