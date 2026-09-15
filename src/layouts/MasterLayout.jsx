import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/layout/TopNavbar';
import BottomNavbar from '../components/layout/BottomNavbar';
import AuthSync from '../components/routing/AuthSync';
import { useRoleNav } from '../hooks/useRoleNav';
import { ROLES } from '../constants/roles';

export default function MasterLayout() {
  const items = useRoleNav(ROLES.MASTER);

  return (
    <div className="flex min-h-screen flex-col">
      <AuthSync />
      <TopNavbar links={items} />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNavbar items={items} />
    </div>
  );
}
