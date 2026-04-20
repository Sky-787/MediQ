import { Outlet } from 'react-router-dom';
import PatientNavbar from '../../components/ui/PatientNavbar';

export default function PatientLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <main className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}