import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import ExamplesView from '@/components/admin/ExamplesView';

export default function Week7ExamplesPage() {
  return (
    <AdminShell week={Week7} title="Examples">
      <ExamplesView/>
    </AdminShell>
  );
}
