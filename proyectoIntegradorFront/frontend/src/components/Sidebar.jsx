import { useApp } from "../context/AppContext";

const links = [
  { hash: "#login", label: "Iniciar sesión", roles: ["anon"] },
  { hash: "#registrar", label: "➕ Registrar paquete", roles: ["empleado", "admin"] },
  { hash: "#dashboard", label: "📈 Dashboard", roles: ["empleado", "auditor", "admin"] },
];

export default function Sidebar() {
  const { user } = useApp();
  const role = user?.role ?? "anon";

  return (
    <aside className="sidebar">
      <nav>
        {links
          .filter(l => l.roles.includes(role))
          .map(l => (
            <a key={l.hash} href={l.hash} className="nav-item">
              {l.label}
            </a>
          ))}
      </nav>
    </aside>
  );
}