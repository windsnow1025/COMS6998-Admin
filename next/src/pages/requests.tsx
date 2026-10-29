import AdminShell from '@/components/admin/AdminShell';
import RequestsView from '@/components/admin/RequestsView';

export default function RequestsPage() {
  return (
    <AdminShell title="Requests">
      <RequestsView/>
    </AdminShell>
  );
}
