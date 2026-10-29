import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import RequestsView from '@/components/admin/RequestsView';

export default function Week7RequestsPage() {
  return (
    <AdminShell week={Week7} title="Requests">
      <RequestsView/>
    </AdminShell>
  );
}
