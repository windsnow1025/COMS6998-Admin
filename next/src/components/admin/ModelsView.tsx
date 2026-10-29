import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {AdminModelResDto, AdminPipelineStepResDto, AdminProviderResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

const MaxTemperature = 2;

function StepRow({step, models, onSaved}: {
  step: AdminPipelineStepResDto;
  models: AdminModelResDto[];
  onSaved: () => void;
}) {
  const toast = useToast();
  const [modelId, setModelId] = React.useState(step.modelId);
  const [temperature, setTemperature] = React.useState(String(step.temperature));
  const [saving, setSaving] = React.useState(false);
  const parsed = Number(temperature);
  const valid = temperature.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= MaxTemperature;
  const changed = modelId !== step.modelId || parsed !== step.temperature;

  const save = async () => {
    setSaving(true);
    const adminClient = new AdminClient();
    try {
      await adminClient.updateStep(step.step, {modelId, temperature: parsed});
      toast.show(`Step "${step.step}" updated.`, 'success');
      onSaved();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  return (
    <TableRow>
      <TableCell>
        <Chip size="small" color="primary" variant="outlined" label={step.step}/>
      </TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          sx={{minWidth: 260}}
          slotProps={{htmlInput: {'aria-label': `Model of the ${step.step} step`}}}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id} disabled={!model.enabled}>
              {model.provider} · {model.name}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={temperature}
          onChange={(event) => setTemperature(event.target.value)}
          error={!valid}
          sx={{width: 110}}
          slotProps={{htmlInput: {min: 0, max: MaxTemperature, step: 0.1, 'aria-label': `Temperature of the ${step.step} step`}}}
        />
      </TableCell>
      <TableCell align="right">
        {changed && (
          <Button size="small" variant="contained" onClick={save} disabled={saving || !valid}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

// The pipeline's 2 steps with the model and the temperature each runs on, and the providers and models they can be set to
export default function ModelsView() {
  const toast = useToast();
  const [steps, setSteps] = React.useState<AdminPipelineStepResDto[] | null>(null);
  const [models, setModels] = React.useState<AdminModelResDto[] | null>(null);
  const [providers, setProviders] = React.useState<AdminProviderResDto[]>([]);
  const [generation, setGeneration] = React.useState(0);
  const reload = () => setGeneration((count) => count + 1);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const [fetchedSteps, fetchedModels, fetchedProviders] = await Promise.all([
          adminClient.fetchSteps(),
          adminClient.fetchModels(),
          adminClient.fetchProviders(),
        ]);
        if (active) {
          setSteps(fetchedSteps);
          setModels(fetchedModels);
          setProviders(fetchedProviders);
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
  }, [generation]);

  const adminClient = new AdminClient();

  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <Card variant="outlined" sx={HoverSx}>
        <Box sx={{p: 2, pb: 1}}>
          <Typography variant="subtitle1">Pipeline steps</Typography>
          <Typography variant="body2" color="text.secondary">
            The model and the temperature each step runs on. A change applies to the next photo.
          </Typography>
        </Box>
        {!steps || !models ? (
          <Box className="flex-center" sx={{minHeight: 120}}>
            <CircularProgress/>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Step</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell align="right"/>
              </TableRow>
            </TableHead>
            <TableBody>
              {steps.map((step) => (
                <StepRow key={`${step.step}-${generation}`} step={step} models={models} onSaved={reload}/>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CrudView<AdminProviderResDto>
        key={`providers-${generation}`}
        title="LLM providers"
        description="Its API key is set on the server."
        noun="provider"
        emptyText="No provider."
        deleteBody="Its models go with it. A provider with a model a step runs on cannot be deleted."
        columns={[
          {key: 'name', label: 'Name', render: (row) => row.name},
          {key: 'apiType', label: 'API type', render: (row) => row.apiType},
          {key: 'enabled', label: 'Enabled', render: (row) => (row.enabled ? 'Yes' : 'No')},
          {key: 'models', label: 'Models', align: 'right', render: (row) => row.models},
        ]}
        fields={[
          {key: 'name', label: 'Name', type: 'text', required: true, maxLength: 64},
          {key: 'apiType', label: 'API type', type: 'text', required: true, maxLength: 64, helper: 'For example OpenAI or Google AI Studio'},
          {key: 'enabled', label: 'Enabled', type: 'switch'},
        ]}
        rowKey={(row) => row.id}
        toValues={(row) => ({name: row.name, apiType: row.apiType, enabled: row.enabled})}
        load={() => adminClient.fetchProviders()}
        create={async (values) => {
          await adminClient.createProvider({name: String(values.name), apiType: String(values.apiType), enabled: values.enabled === true});
          reload();
        }}
        update={async (row, values) => {
          await adminClient.updateProvider(row.id, {name: String(values.name), apiType: String(values.apiType), enabled: values.enabled === true});
          reload();
        }}
        remove={async (row) => {
          await adminClient.deleteProvider(row.id);
          reload();
        }}
      />

      <CrudView<AdminModelResDto>
        key={`models-${generation}`}
        title="LLM models"
        noun="model"
        emptyText="No model."
        deleteBody="A model a step runs on cannot be deleted."
        columns={[
          {key: 'provider', label: 'Provider', render: (row) => row.provider},
          {key: 'name', label: 'Model', render: (row) => row.name},
          {key: 'enabled', label: 'Enabled', render: (row) => (row.enabled ? 'Yes' : 'No')},
          {
            key: 'steps',
            label: 'Steps',
            render: (row) => (
              <Box className="flex-normal" sx={{gap: 0.5}}>
                {row.steps.map((step) => <Chip key={step} size="small" color="primary" variant="outlined" label={step}/>)}
              </Box>
            ),
          },
        ]}
        fields={[
          {
            key: 'providerId',
            label: 'Provider',
            type: 'select',
            required: true,
            createOnly: true,
            options: providers.map((provider) => ({value: provider.id, label: provider.name})),
          },
          {key: 'name', label: 'Model', type: 'text', required: true, maxLength: 64},
          {key: 'enabled', label: 'Enabled', type: 'switch'},
        ]}
        rowKey={(row) => row.id}
        toValues={(row) => ({providerId: row.providerId, name: row.name, enabled: row.enabled})}
        load={() => adminClient.fetchModels()}
        create={async (values) => {
          await adminClient.createModel({providerId: String(values.providerId), name: String(values.name), enabled: values.enabled === true});
          reload();
        }}
        update={async (row, values) => {
          await adminClient.updateModel(row.id, {name: String(values.name), enabled: values.enabled === true});
          reload();
        }}
        remove={async (row) => {
          await adminClient.deleteModel(row.id);
          reload();
        }}
      />
    </Box>
  );
}
