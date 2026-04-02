import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="layout">
        <Sidebar />
        <section className="content">
          {children}
        </section>
      </main>
    </>
  );
}
