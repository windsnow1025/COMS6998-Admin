import AdminShell from '@/components/admin/AdminShell';
import {Week6} from '@/components/admin/Weeks';
import PhotosView from '@/components/admin/PhotosView';

export default function Week6PhotosPage() {
  return (
    <AdminShell week={Week6} title="Photos">
      <PhotosView/>
    </AdminShell>
  );
}
