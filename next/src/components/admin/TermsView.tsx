import * as React from 'react';
import Typography from '@mui/material/Typography';
import {AdminTermResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';

// The audience's vernacular, which the caption step may bring in where a photo calls for it
export default function TermsView() {
  const adminClient = new AdminClient();
  return (
    <CrudView<AdminTermResDto>
      title="Terms"
      description="Vocabulary given to the caption step."
      noun="term"
      emptyText="No term yet. The caption step runs without a vocabulary."
      deleteBody="The caption step stops seeing the term."
      columns={[
        {key: 'term', label: 'Term', render: (row) => row.term},
        {key: 'meaning', label: 'Meaning', render: (row) => row.meaning},
        {
          key: 'example',
          label: 'Example',
          render: (row) => <Typography variant="body2" color="text.secondary">{row.example ?? ''}</Typography>,
        },
      ]}
      fields={[
        {key: 'term', label: 'Term', type: 'text', required: true, maxLength: 64},
        {key: 'meaning', label: 'Meaning', type: 'textarea', required: true, maxLength: 2000},
        {key: 'example', label: 'Example', type: 'textarea', maxLength: 2000},
      ]}
      rowKey={(row) => row.id}
      toValues={(row) => ({term: row.term, meaning: row.meaning, example: row.example ?? ''})}
      load={() => adminClient.fetchTerms()}
      create={(values) => adminClient.createTerm({term: String(values.term), meaning: String(values.meaning), example: String(values.example ?? '')})}
      update={(row, values) => adminClient.updateTerm(row.id, {term: String(values.term), meaning: String(values.meaning), example: String(values.example ?? '')})}
      remove={(row) => adminClient.deleteTerm(row.id)}
    />
  );
}
