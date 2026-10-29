import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import VotesView from '@/components/admin/VotesView';

export default function Week7VotesPage() {
  return (
    <AdminShell week={Week7} title="Votes">
      <VotesView/>
    </AdminShell>
  );
}
