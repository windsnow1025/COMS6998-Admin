import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {AdminAccessPolicyResDto, AdminDomainResDto, AdminEmailResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import CrudView from './CrudView';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

// Who may create an account: anyone while sign-up is not restricted; otherwise an address of a listed domain, or an
// address listed itself. An account that exists keeps signing in.
export default function AccessView() {
  const toast = useToast();
  const adminClient = new AdminClient();
  const [policy, setPolicy] = React.useState<AdminAccessPolicyResDto | null>(null);
  const [saving, setSaving] = React.useState(false);

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
      toast.show(restricted ? 'Sign-up is now limited to the lists.' : 'Sign-up is now open to everyone.', 'success');
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <Card variant="outlined" sx={{...HoverSx, p: 2}}>
        <Typography variant="subtitle1">Sign-up</Typography>
        {policy === null ? (
          <Box className="flex-center" sx={{minHeight: 56}}>
            <CircularProgress size={24}/>
          </Box>
        ) : (
          <>
            <FormControlLabel
              control={<Switch checked={policy.restricted} disabled={saving} onChange={(event) => setRestricted(event.target.checked)}/>}
              label="Restrict sign-up to the lists below"
            />
            <Typography variant="body2" color={policy.restricted ? 'warning.main' : 'text.secondary'}>
              {policy.restricted
                ? 'Limited to the listed domains and addresses. With both lists empty, nobody new can sign up.'
                : 'Open to everyone. The lists apply once restriction is on.'}
            </Typography>
          </>
        )}
      </Card>
      <CrudView<AdminDomainResDto>
        title="Allowed sign-up domains"
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
        create={(values) => adminClient.createDomain(String(values.domain))}
        update={(row, values) => adminClient.updateDomain(row.id, String(values.domain))}
        remove={(row) => adminClient.deleteDomain(row.id)}
      />
      <CrudView<AdminEmailResDto>
        title="Whitelisted email addresses"
        description="Allowed whatever their domain."
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
        create={(values) => adminClient.createEmail(String(values.email))}
        update={(row, values) => adminClient.updateEmail(row.id, String(values.email))}
        remove={(row) => adminClient.deleteEmail(row.id)}
      />
    </Box>
  );
}
