import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import UsersView from '@/components/admin/UsersView';

export default function Week7UsersPage() {
  return (
    <AdminShell week={Week7} title="Users">
      <UsersView/>
    </AdminShell>
  );
}
