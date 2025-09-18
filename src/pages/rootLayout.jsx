import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function RootLayout() {
  return (
    <>
      <Header />
      <section className="align-element py-20">
        <Outlet />
      </section>
    </>
  );
}