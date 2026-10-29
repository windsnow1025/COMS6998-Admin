import {useRouter} from 'next/router';
import AdminShell from '@/components/admin/AdminShell';
import PhotoDetailView from '@/components/admin/PhotoDetailView';
import {Week6} from '@/components/admin/Weeks';

export default function Week6PhotoDetailPage() {
  const router = useRouter();
  const id = router.query.id;

  return (
    <AdminShell week={Week6} title="Photo">
      {typeof id === 'string' && <PhotoDetailView id={id} editable={false}/>}
    </AdminShell>
  );
}
