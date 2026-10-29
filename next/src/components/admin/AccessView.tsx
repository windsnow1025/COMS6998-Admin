import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {AdminAccessPolicyResDto, AdminDomainResDto, AdminEmailResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import CrudView from './CrudView';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

const TitleId = 'sign-up-restriction-title';
const StatusId = 'sign-up-restriction-status';

// Who may create an account: anyone while sign-up is not restricted; otherwise an address of a listed domain, or an
// address listed itself. An account that exists keeps signing in.
export default function AccessView() {
  const toast = useToast();
  const adminClient = new AdminClient();
  const [policy, setPolicy] = React.useState<AdminAccessPolicyResDto | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [domainCount, setDomainCount] = React.useState<number | null>(null);
  const [emailCount, setEmailCount] = React.useState<number | null>(null);
  // Restricted with nothing listed: nobody new can sign up
  const lockedOut = policy?.restricted === true && domainCount === 0 && emailCount === 0;

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const fetched = await new AdminClient().fetchAccessPolicy();
        if (active) {
          setPolicy(fetched);
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
  }, []);

  const setRestricted = async (restricted: boolean) => {
    setSaving(true);
    try {
      setPolicy(await adminClient.updateAccessPolicy(restricted));
      toast.show(restricted ? 'Sign-up is now restricted to the lists.' : 'Sign-up is now open to everyone.', 'success');
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  // A non-breaking space keeps the card's height while the policy loads
  const status = policy === null
    ? ' '
    : !policy.restricted
      ? 'Open to everyone.'
      : lockedOut
        ? 'Restricted to the listed domains and addresses. With both lists empty, nobody new can sign up.'
        : 'Restricted to the listed domains and addresses.';

  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <Card variant="outlined" sx={HoverSx}>
        <Box className="flex-between" sx={{p: 2, gap: 2}}>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="subtitle1" id={TitleId}>Restrict sign-up to the lists below</Typography>
            <Typography variant="body2" id={StatusId} color={lockedOut ? 'error.main' : 'text.secondary'}>
              {status}
            </Typography>
          </Box>
          {policy === null ? (
            // The switch's slot, so the control does not move once it arrives
            <Box className="flex-center" sx={{width: 58, mr: -1}}>
              <CircularProgress size={24}/>
            </Box>
          ) : (
            <Switch
              edge="end"
              checked={policy.restricted}
              disabled={saving}
              onChange={(event) => setRestricted(event.target.checked)}
              slotProps={{input: {'aria-labelledby': TitleId, 'aria-describedby': StatusId}}}
            />
          )}
        </Box>
      </Card>
      <CrudView<AdminDomainResDto>
        title="Allowed sign-up domains"
        description="Any address of a listed domain may sign up."
        noun="domain"
        emptyText="No domain listed."
        deleteBody="While sign-up is restricted, new addresses of the domain can no longer sign up, unless whitelisted."
        columns={[
          {key: 'domain', label: 'Domain', render: (row) => row.domain},
          {key: 'createdAt', label: 'Added', render: (row) => formatInstant(row.createdAt)},
        ]}
        fields={[{key: 'domain', label: 'Domain', type: 'text', required: true, maxLength: 255, helper: 'For example columbia.edu'}]}
        rowKey={(row) => row.id}
        toValues={(row) => ({domain: row.domain})}
        load={() => adminClient.fetchDomains()}
        onLoaded={(rows) => setDomainCount(rows.length)}
        create={(values) => adminClient.createDomain(String(values.domain))}
        update={(row, values) => adminClient.updateDomain(row.id, String(values.domain))}
        remove={(row) => adminClient.deleteDomain(row.id)}
      />
      <CrudView<AdminEmailResDto>
        title="Whitelisted email addresses"
        description="A listed address may sign up whatever its domain."
        noun="address"
        emptyText="No address listed."
        deleteBody="While sign-up is restricted, the address can no longer sign up, unless its domain is allowed."
        columns={[
          {key: 'email', label: 'Email address', render: (row) => row.email},
          {key: 'createdAt', label: 'Added', render: (row) => formatInstant(row.createdAt)},
        ]}
        fields={[{key: 'email', label: 'Email address', type: 'text', required: true, maxLength: 255}]}
        rowKey={(row) => row.id}
        toValues={(row) => ({email: row.email})}
        load={() => adminClient.fetchEmails()}
        onLoaded={(rows) => setEmailCount(rows.length)}
        create={(values) => adminClient.createEmail(String(values.email))}
        update={(row, values) => adminClient.updateEmail(row.id, String(values.email))}
        remove={(row) => adminClient.deleteEmail(row.id)}
      />
    </Box>
  );
}
