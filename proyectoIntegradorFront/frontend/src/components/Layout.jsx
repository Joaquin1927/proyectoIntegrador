import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Header />
      <main className="layout">
        <Sidebar />
        <section className="content">
          <Outlet /> 
        </section>
      </main>
    </>
  );
}