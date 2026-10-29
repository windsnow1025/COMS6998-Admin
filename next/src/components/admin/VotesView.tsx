import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {AdminVotePageResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {useBase} from './AdminBase';
import {formatInstant, truncate} from '@/lib/admin/Format';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

const RowsPerPage = 25;

export default function VotesView() {
  const toast = useToast();
  const base = useBase();
  const [page, setPage] = React.useState(0);
  const [result, setResult] = React.useState<AdminVotePageResDto | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const votes = await adminClient.fetchVotes(RowsPerPage, page * RowsPerPage);
        if (active) {
          setResult(votes);
        }
      } catch (error) {
        toast.show((error as Error).message, 'error');
      }
    };
    load();
    return () => {
      active = false;
    };
    // toast is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (!result) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  return (
    <Card variant="outlined" sx={HoverSx}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>When</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Vote</TableCell>
            <TableCell>Caption</TableCell>
            <TableCell>Photo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.votes.map((vote) => (
            <TableRow key={vote.id}>
              <TableCell sx={{whiteSpace: 'nowrap'}}>{formatInstant(vote.createdAt)}</TableCell>
              <TableCell>{vote.user.username}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={vote.value > 0 ? 'success' : 'default'}
                  label={vote.value > 0 ? 'pick' : 'down'}
                />
              </TableCell>
              <TableCell>{truncate(vote.captionContent, 80)}</TableCell>
              <TableCell>
                <Link href={`${base}/photos/${vote.imageId}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vote.imageUrl}
                    alt=""
                    width={40}
                    height={30}
                    style={{objectFit: 'cover', borderRadius: 4, display: 'block'}}
                  />
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {result.votes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                  No votes yet.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={result.total}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={RowsPerPage}
        rowsPerPageOptions={[RowsPerPage]}
      />
    </Card>
  );
}
