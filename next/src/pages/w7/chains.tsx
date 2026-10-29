import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import ChainsView from '@/components/admin/ChainsView';

export default function Week7ChainsPage() {
  return (
    <AdminShell week={Week7} title="Chains">
      <ChainsView/>
    </AdminShell>
  );
}
