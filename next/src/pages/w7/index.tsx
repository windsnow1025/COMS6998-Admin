import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import OverviewView from '@/components/admin/OverviewView';

export default function Week7OverviewPage() {
  return (
    <AdminShell week={Week7} title="Overview">
      <OverviewView/>
    </AdminShell>
  );
}
