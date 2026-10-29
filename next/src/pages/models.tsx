import AdminShell from '@/components/admin/AdminShell';
import ModelsView from '@/components/admin/ModelsView';

export default function ModelsPage() {
  return (
    <AdminShell title="Models">
      <ModelsView/>
    </AdminShell>
  );
}
