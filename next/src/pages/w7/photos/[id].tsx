import {useRouter} from 'next/router';
import AdminShell from '@/components/admin/AdminShell';
import PhotoDetailView from '@/components/admin/PhotoDetailView';
import {Week7} from '@/components/admin/Weeks';

export default function Week7PhotoDetailPage() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <AdminShell week={Week7} title="Photo">
      {typeof id === 'string' && <PhotoDetailView id={id} editable={true}/>}
    </AdminShell>
  );
}
