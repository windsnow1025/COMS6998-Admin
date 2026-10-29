import AdminShell from '@/components/admin/AdminShell';
import {Week7} from '@/components/admin/Weeks';
import PhotosView from '@/components/admin/PhotosView';

export default function Week7PhotosPage() {
  return (
    <AdminShell week={Week7} title="Photos">
      <PhotosView/>
    </AdminShell>
  );
}
