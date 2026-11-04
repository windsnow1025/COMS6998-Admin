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
import {AdminAvailableModelResDto, AdminModelResDto, AdminProviderResDto, AdminScreeningResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import CrudView from './CrudView';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';
import VoiceName from './VoiceName';

const MaxTemperature = 2;

// The screening's model and temperature, saved together
function ScreeningRow({screening, models, onSaved}: {
  screening: AdminScreeningResDto;
  models: AdminModelResDto[];
  onSaved: () => void;
}) {
  const toast = useToast();
  const [modelId, setModelId] = React.useState(screening.modelId);
  const [temperature, setTemperature] = React.useState(String(screening.temperature));
  const [saving, setSaving] = React.useState(false);
  const parsed = Number(temperature);
  const valid = temperature.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= MaxTemperature;
  const changed = modelId !== screening.modelId || parsed !== screening.temperature;

  const save = async () => {
    setSaving(true);
    const adminClient = new AdminClient();
    try {
      await adminClient.updateScreening({modelId, temperature: parsed});
      toast.show('Screening updated.', 'success');
      onSaved();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  return (
    <TableRow>
      <TableCell>
        <Chip size="small" color="primary" variant="outlined" label={screening.step}/>
      </TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          sx={{minWidth: 260}}
          slotProps={{htmlInput: {'aria-label': 'Model of the screening'}}}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id} disabled={!model.enabled || !model.providerEnabled}>
              {model.apiType} · {model.name}
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
          slotProps={{htmlInput: {min: 0, max: MaxTemperature, step: 0.1, 'aria-label': 'Temperature of the screening'}}}
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

// The screening with the model and the temperature it runs on, and the providers and models a step can be set to
export default function ModelsView() {
  const toast = useToast();
  const [screening, setScreening] = React.useState<AdminScreeningResDto | null>(null);
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
        const [fetchedScreening, fetchedModels, fetchedProviders, fetchedAvailable] = await Promise.all([
          adminClient.fetchScreening(),
          adminClient.fetchModels(),
          adminClient.fetchProviders(),
          adminClient.fetchAvailableModels(),
        ]);
        if (active) {
          setScreening(fetchedScreening);
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
          <Typography variant="subtitle1">Screening</Typography>
          <Typography variant="body2" color="text.secondary">
            The model and the temperature the screening runs on. A change applies to the next photo.
          </Typography>
        </Box>
        {!screening || !models ? (
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
              <ScreeningRow key={generation} screening={screening} models={models} onSaved={reload}/>
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
