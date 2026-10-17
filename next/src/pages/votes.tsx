import AdminShell from '@/components/admin/AdminShell';
import VotesView from '@/components/admin/VotesView';

export default function VotesPage() {
  return (
    <AdminShell title="Votes">
      <VotesView/>
    </AdminShell>
  );
}
