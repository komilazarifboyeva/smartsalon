import { Outlet } from 'react-router-dom';
import { Home } from 'lucide-react';
import TopNavbar from '../components/layout/TopNavbar';
import Footer from '../components/layout/Footer';
import AuthSync from '../components/routing/AuthSync';
import { ROUTES } from '../constants/routes';

const PUBLIC_LINKS = [
  { to: ROUTES.HOME, labelKey: 'nav.home', icon: Home, end: true },
];

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthSync />
      <TopNavbar links={PUBLIC_LINKS} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
