import ServicesManager from '../../components/services/ServicesManager';

export default function MasterDashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <ServicesManager scope="master" />
    </div>
  );
}
