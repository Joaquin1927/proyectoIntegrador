import { msalInstance } from "../auth/msalConfig";
import { useToast } from "../ui/Toaster";
import { ArrowRight, BarChart3, Leaf, LockKeyhole, ShieldCheck } from "lucide-react";

export default function Login() {
  const toast = useToast();
  const submit = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.loginRedirect({
        scopes: [import.meta.env.VITE_SCOPE],
        prompt: "select_account",
      });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo iniciar sesión con Microsoft");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-copy">
          <span className="login-mark"><Leaf size={25} /></span>
          <span className="entity-eyebrow">CO₂X · DIGITAL MRV</span>
          <h1>Carbono verificable.<br /><em>Impacto transparente.</em></h1>
          <p>Gestioná captura, auditoría y tokenización desde una plataforma trazable de punta a punta.</p>
          <div className="login-features"><span><ShieldCheck /> Auditoría segura</span><span><BarChart3 /> Trazabilidad en tiempo real</span><span><LockKeyhole /> Acceso corporativo</span></div>
        </div>
        <div className="login-access">
          <div className="login-access__icon"><LockKeyhole size={22} /></div>
          <span className="entity-eyebrow">ACCESO SEGURO</span>
          <h2>Bienvenida a CO₂X</h2>
          <p>Ingresá con tu cuenta institucional para acceder a tu espacio de trabajo.</p>
          <button className="login-microsoft" onClick={submit}><span className="microsoft-mark"><i /><i /><i /><i /></span>Continuar con Microsoft<ArrowRight size={17} /></button>
          <small>Tu acceso y rol son administrados mediante Microsoft Entra ID.</small>
        </div>
      </section>
    </main>
  );
}
