import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {AdminChainResDto, AdminExampleResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';
import {useToast} from './Toast';

const MaxCaptionLength = 160;

// Caption examples: a caption in a voice with the photo description it was written for, which the caption step
// gets as a further example of the voice
export default function ExamplesView() {
  const toast = useToast();
  const [chains, setChains] = React.useState<AdminChainResDto[] | null>(null);

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
      description="Further examples given to the caption step."
      noun="example"
      emptyText="No example yet. Each voice runs on the examples inside its own instruction."
      deleteBody="The caption step stops seeing the example."
      columns={[
        {key: 'voice', label: 'Voice', render: (row) => <Chip size="small" color="primary" variant="outlined" label={row.flavor.name}/>},
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
