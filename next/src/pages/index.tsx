import AdminShell from '@/components/admin/AdminShell';
import OverviewView from '@/components/admin/OverviewView';

export default function OverviewPage() {
  return (
    <AdminShell title="Overview">
      <OverviewView/>
    </AdminShell>
  );
}
