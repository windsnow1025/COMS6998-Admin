import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import AccessView from '@/components/admin/AccessView';

export default function Week7AccessPage() {
  return (
    <AdminShell week={Week7} title="Access">
      <AccessView/>
    </AdminShell>
  );
}
