import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {AdminUserResDto, AdminUserResDtoRolesEnum} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

export default function UsersView() {
  const toast = useToast();
  const [users, setUsers] = React.useState<AdminUserResDto[] | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        setUsers(await adminClient.fetchUsers());
      } catch (error) {
        toast.show((error as Error).message, 'error');
      }
    };
    load();
    // toast is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!users) {
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
            <TableCell>ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="right">Photos</TableCell>
            <TableCell align="right">Photos judged</TableCell>
            <TableCell>Last active</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Box className="flex-normal" sx={{gap: 0.5}}>
                  {(user.roles ?? []).map((role) => (
                    <Chip
                      key={role}
                      size="small"
                      color={role === AdminUserResDtoRolesEnum.Admin ? 'warning' : 'default'}
                      label={role}
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell align="right">{user.photos}</TableCell>
              <TableCell align="right">{user.photosJudged}</TableCell>
              <TableCell>{user.lastActiveAt ? formatInstant(user.lastActiveAt) : '—'}</TableCell>
              <TableCell>{formatInstant(user.createdAt)}</TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                  No users.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
