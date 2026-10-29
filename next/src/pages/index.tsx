import {GetServerSideProps} from 'next';
import {LatestWeek} from '@/components/admin/Weeks';

// The root is the latest week's admin
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {destination: LatestWeek.base, permanent: false},
});

export default function RootPage() {
  return null;
}
