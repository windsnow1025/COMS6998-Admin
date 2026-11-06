import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  AdminAvailableModelResDto,
  AdminModelResDto,
  AdminPipelineStepResDto,
  AdminPipelineStepResDtoStepEnum,
  AdminProviderResDto,
} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';
import ExpandButton from './ExpandButton';
import {HoverSx} from './HoverSx';
import PromptBlock from './PromptBlock';
import {useToast} from './Toast';
import VoiceName from './VoiceName';

// What each of the product's own steps does
const StepTasks: Record<AdminPipelineStepResDtoStepEnum, string> = {
  [AdminPipelineStepResDtoStepEnum.Screen]: 'Passes or rejects an uploaded photo, and nothing else.',
  [AdminPipelineStepResDtoStepEnum.Describe]: 'Describes a photo once, as the first step of every chain.',
};

// One of the product's own steps: its task, the model it runs on, and its prompts behind the chevron
function PipelineStepRows({step, models, onSaved}: {
  step: AdminPipelineStepResDto;
  models: AdminModelResDto[];
  onSaved: () => void;
}) {
  const toast = useToast();
  const [modelId, setModelId] = React.useState(step.modelId);
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const changed = modelId !== step.modelId;

  const save = async () => {
    setSaving(true);
    const adminClient = new AdminClient();
    try {
      await adminClient.updatePipelineStep(step.step, {modelId});
      toast.show('Step updated.', 'success');
      onSaved();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  return (
    <>
      <TableRow>
        <TableCell sx={{borderBottom: 0}}>
          <Chip size="small" color="primary" variant="outlined" label={step.step}/>
        </TableCell>
        <TableCell sx={{borderBottom: 0}}>
          <Typography variant="body2" color="text.secondary">{StepTasks[step.step]}</Typography>
        </TableCell>
        <TableCell sx={{borderBottom: 0}}>
          <TextField
            select
            size="small"
            value={modelId}
            onChange={(event) => setModelId(event.target.value)}
            sx={{minWidth: 260}}
            slotProps={{htmlInput: {'aria-label': `Model of the ${step.step} step`}}}
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id} disabled={!model.enabled || !model.providerEnabled}>
                {model.apiType} · {model.name}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
        <TableCell align="right" sx={{borderBottom: 0, whiteSpace: 'nowrap'}}>
          {changed && (
            <Button size="small" variant="contained" onClick={save} disabled={saving} sx={{mr: 1}}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          )}
          <ExpandButton open={open} label={`Prompts of the ${step.step} step`} onClick={() => setOpen(!open)}/>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4} sx={{p: 0}}>
          <Collapse in={open} unmountOnExit>
            <Box className="flex-column" sx={{gap: 1.5, p: 2, pt: 0.5}}>
              <PromptBlock label="System prompt" text={step.systemPrompt}/>
              <PromptBlock label="User prompt" text={step.userPrompt}/>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// The product's own steps with the models they run on, and the providers and models a step can be set to
export default function ModelsView() {
  const toast = useToast();
  const [pipelineSteps, setPipelineSteps] = React.useState<AdminPipelineStepResDto[] | null>(null);
  const [models, setModels] = React.useState<AdminModelResDto[] | null>(null);
  const [providers, setProviders] = React.useState<AdminProviderResDto[]>([]);
  const [available, setAvailable] = React.useState<AdminAvailableModelResDto[]>([]);
  const [generation, setGeneration] = React.useState(0);
  const reload = () => setGeneration((count) => count + 1);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const [fetchedPipelineSteps, fetchedModels, fetchedProviders, fetchedAvailable] = await Promise.all([
          adminClient.fetchPipelineSteps(),
          adminClient.fetchModels(),
          adminClient.fetchProviders(),
          adminClient.fetchAvailableModels(),
        ]);
        if (active) {
          setPipelineSteps(fetchedPipelineSteps);
          setModels(fetchedModels);
          setProviders(fetchedProviders);
          setAvailable(fetchedAvailable);
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
  // The API types FastAPI's model list names, and the models of one of them
  const apiTypes = [...new Set(available.map((row) => row.apiType))].sort();
  const modelsOf = (apiType: string) => available.filter((row) => row.apiType === apiType).map((row) => ({value: row.model, label: row.model}));

  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <Card variant="outlined" sx={HoverSx}>
        <Box sx={{p: 2, pb: 1}}>
          <Typography variant="subtitle1">Screening and description</Typography>
          <Typography variant="body2" color="text.secondary">
            The product&apos;s own steps on an uploaded photo, each on the model set here. A change applies to the next photo.
          </Typography>
        </Box>
        {!pipelineSteps || !models ? (
          <Box className="flex-center" sx={{minHeight: 120}}>
            <CircularProgress/>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Step</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Model</TableCell>
                <TableCell align="right"/>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelineSteps.map((step) => (
                <PipelineStepRows key={`${step.step}-${generation}`} step={step} models={models} onSaved={reload}/>
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
          {key: 'apiType', label: 'API type', render: (row) => row.apiType},
          {key: 'enabled', label: 'Enabled', render: (row) => (row.enabled ? 'Yes' : 'No')},
          {key: 'models', label: 'Models', align: 'right', render: (row) => row.models},
        ]}
        fields={[
          {key: 'apiType', label: 'API type', type: 'select', required: true, createOnly: true, options: apiTypes.map((apiType) => ({value: apiType, label: apiType}))},
          {key: 'enabled', label: 'Enabled', type: 'switch'},
        ]}
        rowKey={(row) => row.id}
        toValues={(row) => ({apiType: row.apiType, enabled: row.enabled})}
        load={() => adminClient.fetchProviders()}
        create={async (values) => {
          await adminClient.createProvider({apiType: String(values.apiType), enabled: values.enabled === true});
          reload();
        }}
        update={async (row, values) => {
          await adminClient.updateProvider(row.id, {enabled: values.enabled === true});
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
          {key: 'provider', label: 'Provider', render: (row) => row.apiType},
          {key: 'name', label: 'Model', render: (row) => row.name},
          {key: 'enabled', label: 'Enabled', render: (row) => (row.enabled ? 'Yes' : 'No')},
          {
            key: 'steps',
            label: 'Steps',
            render: (row) => (
              <Box className="flex-normal" sx={{gap: 1.5}}>
                {row.steps.map((entry) => (
                  <Box key={`${entry.flavor?.slug ?? ''}:${entry.step}`} className="flex-normal" sx={{gap: 0.75}}>
                    {entry.flavor && <VoiceName name={entry.flavor.name} color={entry.flavor.color}/>}
                    <Chip size="small" color="primary" variant="outlined" label={entry.step}/>
                  </Box>
                ))}
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
            options: providers.map((provider) => ({value: provider.id, label: provider.apiType})),
          },
          {
            key: 'name',
            label: 'Model',
            type: 'select',
            required: true,
            options: (values) => modelsOf(providers.find((provider) => provider.id === values.providerId)?.apiType ?? ''),
          },
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
