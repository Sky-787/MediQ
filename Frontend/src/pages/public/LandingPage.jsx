import { useNavigate } from "react-router-dom";
import { Calendar, UserCheck, FileText, Bell } from "lucide-react";

import MyButton from "../../components/ui/MyButton";
import CustomCard from "../../components/ui/CustomCard";
import Footer from "../../components/ui/Footer";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div>

      {/* HERO */}
      <section className="text-center py-24 bg-gradient-to-r from-teal-500 to-blue-900 text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Tu salud, en tus manos
        </h1>

        <p className="mb-6 max-w-xl mx-auto text-lg">
          Gestiona tus citas médicas de forma fácil, rápida y segura con MediQ
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <MyButton
            label="Reservar Cita"
            onClick={() => navigate("/register")}
          />
          <MyButton
            label="Iniciar Sesión"
            variant="outline"
            onClick={() => navigate("/login")}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <CustomCard>
          <div className="flex flex-col items-center text-center">
            <Calendar size={40} className="mb-3 text-teal-700" />
            <h3 className="font-bold mb-1">Reserva Fácil</h3>
            <p>Agenda tus citas en pocos pasos.</p>
          </div>
        </CustomCard>

        <CustomCard>
          <div className="flex flex-col items-center text-center">
            <UserCheck size={40} className="mb-3 text-teal-700" />
            <h3 className="font-bold mb-1">Médicos Certificados</h3>
            <p>Profesionales confiables y verificados.</p>
          </div>
        </CustomCard>

        <CustomCard>
          <div className="flex flex-col items-center text-center">
            <FileText size={40} className="mb-3 text-teal-700" />
            <h3 className="font-bold mb-1">Historial de Citas</h3>
            <p>Accede a tus consultas anteriores.</p>
          </div>
        </CustomCard>

        <CustomCard>
          <div className="flex flex-col items-center text-center">
            <Bell size={40} className="mb-3 text-teal-700" />
            <h3 className="font-bold mb-1">Notificaciones</h3>
            <p>Recibe recordatorios y alertas.</p>
          </div>
        </CustomCard>
      </section>

      {/* HOW IT WORKS */}
      <section className="p-12 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-6">¿Cómo funciona?</h2>

        <div className="space-y-3 text-lg">
          <p><strong>1.</strong> Regístrate en la plataforma</p>
          <p><strong>2.</strong> Busca tu médico y agenda tu cita</p>
          <p><strong>3.</strong> Recibe atención y seguimiento</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;