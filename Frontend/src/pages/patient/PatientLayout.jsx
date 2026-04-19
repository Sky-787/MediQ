import { Outlet } from 'react-router-dom';
import PatientNavbar from '../../components/ui/PatientNavbar';

export default function PatientLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}