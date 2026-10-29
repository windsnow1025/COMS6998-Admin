import AdminShell from '@/components/admin/AdminShell';
import {Week6} from '@/components/admin/Weeks';
import UsersView from '@/components/admin/UsersView';

export default function Week6UsersPage() {
  return (
    <AdminShell week={Week6} title="Users">
      <UsersView/>
    </AdminShell>
  );
}
