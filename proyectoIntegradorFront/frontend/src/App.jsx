import Layout from "./components/Layout";
import Login from "./pages/Login";

export default function App() {
  const hash = window.location.hash;

  let Page = Login;

  return (
    <Layout>
      <Page />
    </Layout>
  );
}