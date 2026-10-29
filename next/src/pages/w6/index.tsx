import AdminShell from '@/components/admin/AdminShell';
import {Week6} from '@/components/admin/Weeks';
import OverviewView from '@/components/admin/OverviewView';

export default function Week6OverviewPage() {
  return (
    <AdminShell week={Week6} title="Overview">
      <OverviewView/>
    </AdminShell>
  );
}
