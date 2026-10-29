import * as React from 'react';
import Box from '@mui/material/Box';
import {AdminDomainResDto, AdminEmailResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import CrudView from './CrudView';

// Who may create an account: with nothing listed, anyone; otherwise an address of a listed domain, or an address listed itself.
// An account that exists keeps signing in.
export default function AccessView() {
  const adminClient = new AdminClient();
  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <CrudView<AdminDomainResDto>
        title="Allowed sign-up domains"
        description="With both lists empty, anyone can sign up."
        noun="domain"
        emptyText="No domain listed."
        deleteBody="New addresses of the domain can no longer sign up, unless whitelisted."
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
        deleteBody="The address can no longer sign up, unless its domain is allowed."
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
