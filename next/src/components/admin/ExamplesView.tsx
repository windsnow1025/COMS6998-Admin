import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {ChainResDto, AdminExampleResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';
import {useToast} from './Toast';
import VoiceName from './VoiceName';

const MaxCaptionLength = 160;

// Caption examples: a caption in a voice with the photo description it was written for, which a step of the voice's
// chain gets where its prompt carries {examples}
export default function ExamplesView() {
  const toast = useToast();
  const [chains, setChains] = React.useState<ChainResDto[] | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const fetched = await adminClient.fetchChains();
        if (active) {
          setChains(fetched);
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

  if (!chains) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  const adminClient = new AdminClient();
  return (
    <CrudView<AdminExampleResDto>
      title="Caption examples"
      description="Further examples a chain's step gets where its prompt carries {examples}."
      noun="example"
      emptyText="No example yet."
      deleteBody="No step sees the example after this."
      columns={[
        {key: 'voice', label: 'Voice', render: (row) => <VoiceName name={row.flavor.name} color={row.flavor.color}/>},
        {
          key: 'description',
          label: 'Photo description',
          render: (row) => <Typography variant="body2" color="text.secondary">{row.description}</Typography>,
        },
        {key: 'caption', label: 'Caption', render: (row) => row.caption},
      ]}
      fields={[
        {
          key: 'flavorSlug',
          label: 'Voice',
          type: 'select',
          required: true,
          options: chains.map((chain) => ({value: chain.slug, label: chain.name})),
        },
        {key: 'description', label: 'Photo description', type: 'textarea', required: true, maxLength: 4000},
        {key: 'caption', label: 'Caption', type: 'text', required: true, maxLength: MaxCaptionLength},
      ]}
      rowKey={(row) => row.id}
      toValues={(row) => ({flavorSlug: row.flavor.slug, description: row.description, caption: row.caption})}
      load={() => adminClient.fetchExamples()}
      create={(values) => adminClient.createExample({flavorSlug: String(values.flavorSlug), description: String(values.description), caption: String(values.caption)})}
      update={(row, values) => adminClient.updateExample(row.id, {flavorSlug: String(values.flavorSlug), description: String(values.description), caption: String(values.caption)})}
      remove={(row) => adminClient.deleteExample(row.id)}
    />
  );
}
