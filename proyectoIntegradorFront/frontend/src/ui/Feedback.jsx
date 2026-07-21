import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";

export function LoadingState({ title = "Cargando información", text = "Esto puede demorar unos segundos." }) {
  return <div className="ui-state"><span className="ui-spinner" /><strong>{title}</strong><p>{text}</p></div>;
}

export function InlineAlert({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={`ui-alert ui-alert--${type}`} role={type === "error" ? "alert" : "status"}><Icon size={19} /><span>{children}</span></div>;
}

export function EmptyState({ title, text, action }) {
  return <div className="ui-state ui-state--empty"><span className="ui-state__icon"><Inbox size={25} /></span><strong>{title}</strong><p>{text}</p>{action}</div>;
}
