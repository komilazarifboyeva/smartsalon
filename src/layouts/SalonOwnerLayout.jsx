import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/layout/Sidebar';
import BottomNavbar from '../components/layout/BottomNavbar';
import TopNavbar from '../components/layout/TopNavbar';
import AuthSync from '../components/routing/AuthSync';
import { useRoleNav } from '../hooks/useRoleNav';
import { ROLES } from '../constants/roles';

export default function SalonOwnerLayout() {
  const { t } = useTranslation();
  const items = useRoleNav(ROLES.SALON_OWNER);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AuthSync />
      <Sidebar items={items} title={t('roles.salon_owner')} />
      <div className="md:hidden">
        <TopNavbar links={[]} />
      </div>
      <div className="md:pl-64">
        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNavbar items={items} />
    </div>
  );
}
