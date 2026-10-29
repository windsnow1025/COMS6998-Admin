import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import ModelsView from '@/components/admin/ModelsView';

export default function Week7ModelsPage() {
  return (
    <AdminShell week={Week7} title="Models">
      <ModelsView/>
    </AdminShell>
  );
}
