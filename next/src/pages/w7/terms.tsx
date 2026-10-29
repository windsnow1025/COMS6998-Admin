import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import TermsView from '@/components/admin/TermsView';

export default function Week7TermsPage() {
  return (
    <AdminShell week={Week7} title="Terms">
      <TermsView/>
    </AdminShell>
  );
}
