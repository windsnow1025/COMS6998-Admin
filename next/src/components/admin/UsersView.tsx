import * as React from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {AdminUserReqDto, AdminUserResDto, AdminUserResDtoRolesEnum} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import {ViewerContext} from './AdminGate';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

// The API's length of a username and of a name
const MaxUserFieldLength = 255;
// The API's refusal of an admin's change of their own admin role
const OwnRoleHold = 'Another admin changes your admin role';

function isAdmin(user: AdminUserResDto): boolean {
  return (user.roles ?? []).includes(AdminUserResDtoRolesEnum.Admin);
}

// The form, mounted while the dialog is open so that it starts from the user each time
function UserForm({user, own, onClose, onSaved}: {
  user: AdminUserResDto;
  own: boolean;
  onClose: () => void;
  onSaved: (user: AdminUserResDto) => void;
}) {
  const toast = useToast();
  const [values, setValues] = React.useState<AdminUserReqDto>({
    username: user.username,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    admin: isAdmin(user),
  });
  const [saving, setSaving] = React.useState(false);
  const set = (change: Partial<AdminUserReqDto>) => setValues((current) => ({...current, ...change}));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await new AdminClient().updateUser(user.id, values);
      toast.show('User updated.', 'success');
      onSaved(updated);
    } catch (error) {
      toast.show((error as Error).message, 'error');
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>Edit user</DialogTitle>
      <DialogContent>
        <Box className="flex-column" sx={{gap: 2, pt: 1}}>
          <TextField label="Email" value={user.email} disabled fullWidth helperText="The sign-in's address, which stays."/>
          <TextField
            label="Username"
            value={values.username}
            onChange={(event) => set({username: event.target.value})}
            required
            fullWidth
            slotProps={{htmlInput: {maxLength: MaxUserFieldLength}}}
          />
          <Box className="flex-normal" sx={{gap: 2, alignItems: 'flex-start'}}>
            <TextField
              label="First name"
              value={values.firstName}
              onChange={(event) => set({firstName: event.target.value})}
              sx={{flex: '1 1 200px'}}
              slotProps={{htmlInput: {maxLength: MaxUserFieldLength}}}
            />
            <TextField
              label="Last name"
              value={values.lastName}
              onChange={(event) => set({lastName: event.target.value})}
              sx={{flex: '1 1 200px'}}
              slotProps={{htmlInput: {maxLength: MaxUserFieldLength}}}
            />
          </Box>
          <FormControl>
            <FormControlLabel
              control={<Switch checked={values.admin} disabled={own} onChange={(event) => set({admin: event.target.checked})}/>}
              label="Admin"
            />
            <FormHelperText sx={{ml: 0}}>
              {own ? OwnRoleHold : 'An admin reads and changes everything in the admin and in the chain tool.'}
            </FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={saving || !values.username.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </>
  );
}

// The users with what each did; an admin changes a user's username, name, and admin role, the admin's own role excepted
export default function UsersView() {
  const toast = useToast();
  const viewer = React.useContext(ViewerContext);
  const [users, setUsers] = React.useState<AdminUserResDto[] | null>(null);
  const [editing, setEditing] = React.useState<AdminUserResDto | null>(null);

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

  const saved = (updated: AdminUserResDto) => {
    setUsers(users.map((user) => (user.id === updated.id ? updated : user)));
    setEditing(null);
  };

  return (
    <Card variant="outlined" sx={HoverSx}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Roles</TableCell>
            <TableCell align="right">Photos</TableCell>
            <TableCell align="right">Photos judged</TableCell>
            <TableCell>Last active</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell align="right"/>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</TableCell>
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
              <TableCell align="right">
                <Tooltip title="Edit">
                  <IconButton size="small" aria-label={`Edit ${user.username}`} onClick={() => setEditing(user)}>
                    <EditRoundedIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={10}>
                <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                  No users.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        {editing && (
          <UserForm user={editing} own={editing.id === viewer?.id} onClose={() => setEditing(null)} onSaved={saved}/>
        )}
      </Dialog>
    </Card>
  );
}
