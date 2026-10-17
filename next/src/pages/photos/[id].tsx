import {useRouter} from 'next/router';
import AdminShell from '@/components/admin/AdminShell';
import PhotoDetailView from '@/components/admin/PhotoDetailView';

export default function PhotoDetailPage() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <AdminShell title="Photo">
      {typeof id === 'string' && <PhotoDetailView id={id}/>}
    </AdminShell>
  );
}
