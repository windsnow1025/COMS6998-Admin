import AdminShell from '@/components/admin/AdminShell';
import PhotosView from '@/components/admin/PhotosView';

export default function PhotosPage() {
  return (
    <AdminShell title="Photos">
      <PhotosView/>
    </AdminShell>
  );
}
