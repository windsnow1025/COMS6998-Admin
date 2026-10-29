import AdminShell from '@/components/admin/AdminShell';
import {Week6} from '@/components/admin/Weeks';
import VotesView from '@/components/admin/VotesView';

export default function Week6VotesPage() {
  return (
    <AdminShell week={Week6} title="Votes">
      <VotesView/>
    </AdminShell>
  );
}
