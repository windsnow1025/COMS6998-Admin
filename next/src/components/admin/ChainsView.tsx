import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  AdminPipelineStepResDto,
  AdminPipelineStepResDtoStepEnum,
  ChainResDto,
  StepResDto,
  StepResDtoInputEnum,
} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import ExpandButton from './ExpandButton';
import {HoverSx} from './HoverSx';
import PromptBlock from './PromptBlock';
import {useToast} from './Toast';
import VoiceName from './VoiceName';

const MinVoicesInMix = 3;
// The rules of the mix, in the API's words
const MixNeedsCaptions = 'A chain in the mix ends with a step that writes captions';
const MixKeepsMinimum = `The mix keeps at least ${MinVoicesInMix} voices`;
// The API's most for a voice's weight; the least is 1
const MaxWeight = 10;
// The steps every chain shares before its own: the photo's description, which the product writes once for a photo
const SharedSteps = 1;

// The step every chain starts with, whose model is set on the Models page
function SharedStepCard({step}: { step: AdminPipelineStepResDto }) {
  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2}}>
      <Box className="flex-normal" sx={{gap: 1, mb: 1.5}}>
        <Chip size="small" color="primary" variant="outlined" label={`Step ${SharedSteps}: ${step.step}`}/>
        <Chip size="small" label="photo in"/>
        <Chip size="small" label="text out"/>
        <Chip size="small" label={`${step.apiType} · ${step.model}`}/>
        <Chip size="small" variant="outlined" label="shared by every chain"/>
      </Box>
      <Box className="flex-column" sx={{gap: 1.5}}>
        <PromptBlock label="System prompt" text={step.systemPrompt}/>
        <PromptBlock label="User prompt" text={step.userPrompt}/>
      </Box>
    </Card>
  );
}

// A voice's weight, saved on its own once changed
function WeightCell({chain, busy, onSaved}: {
  chain: ChainResDto;
  busy: boolean;
  onSaved: (chain: ChainResDto) => void;
}) {
  const toast = useToast();
  const [text, setText] = React.useState(String(chain.weight));
  const [saving, setSaving] = React.useState(false);
  const weight = Number(text);
  const valid = Number.isInteger(weight) && weight >= 1 && weight <= MaxWeight;
  const changed = valid && weight !== chain.weight;

  const save = async () => {
    setSaving(true);
    try {
      onSaved(await new AdminClient().updateChain(chain.slug, {weight}));
      toast.show(`${chain.name} has the weight ${weight}.`, 'success');
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  return (
    <Box className="flex-normal" sx={{gap: 1, justifyContent: 'flex-end'}}>
      {changed && (
        <Button size="small" variant="contained" onClick={save} disabled={busy || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      )}
      <TextField
        size="small"
        type="number"
        value={text}
        onChange={(event) => setText(event.target.value)}
        error={!valid}
        sx={{width: 80}}
        slotProps={{htmlInput: {min: 1, max: MaxWeight, step: 1, 'aria-label': `Weight of ${chain.name}`}}}
      />
    </Box>
  );
}

function StepCard({step}: { step: StepResDto }) {
  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2}}>
      <Box className="flex-normal" sx={{gap: 1, mb: 1.5}}>
        <Chip size="small" color="primary" variant="outlined" label={`Step ${SharedSteps + step.position + 1}: ${step.name}`}/>
        <Chip size="small" label={step.input === StepResDtoInputEnum.Image ? 'photo in' : 'text in'}/>
        <Chip size="small" label={`${step.output} out`}/>
        <Chip size="small" label={`${step.apiType} · ${step.model}`}/>
      </Box>
      <Box className="flex-column" sx={{gap: 1.5}}>
        <PromptBlock label="System prompt" text={step.systemPrompt}/>
        <PromptBlock label="User prompt" text={step.userPrompt}/>
      </Box>
    </Card>
  );
}

// The voices as prompt chains: each row is a voice with its place in the mix, and its panel shows its steps with
// their prompts as the chain tool holds them, the step every chain shares first
export default function ChainsView() {
  const toast = useToast();
  const [chains, setChains] = React.useState<ChainResDto[] | null>(null);
  const [sharedStep, setSharedStep] = React.useState<AdminPipelineStepResDto | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const [fetchedChains, fetchedSteps] = await Promise.all([adminClient.fetchChains(), adminClient.fetchPipelineSteps()]);
        const shared = fetchedSteps.find((step) => step.step === AdminPipelineStepResDtoStepEnum.Describe);
        if (!shared) {
          throw new Error('The API answered no describe step');
        }
        if (active) {
          setChains(fetchedChains);
          setSharedStep(shared);
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

  const toggleMix = async (chain: ChainResDto, inMix: boolean) => {
    setBusy(chain.slug);
    const adminClient = new AdminClient();
    try {
      const updated = await adminClient.updateChain(chain.slug, {inMix});
      setChains((rows) => rows?.map((row) => (row.slug === updated.slug ? updated : row)) ?? null);
      toast.show(inMix ? `${chain.name} is in the mix.` : `${chain.name} is out of the mix.`, 'success');
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setBusy(null);
  };

  if (!chains || !sharedStep) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  const inMix = chains.filter((chain) => chain.inMix).length;
  // Why the mix switch of a chain is disabled; empty when it is not
  const switchHold = (chain: ChainResDto): string => {
    if (chain.inMix && inMix <= MinVoicesInMix) {
      return MixKeepsMinimum;
    }
    if (!chain.inMix && !chain.writesCaptions) {
      return MixNeedsCaptions;
    }
    return '';
  };

  return (
    <Card variant="outlined" sx={HoverSx}>
      <Box sx={{p: 2, pb: 1}}>
        <Typography variant="subtitle1">Prompt chains</Typography>
        <Typography variant="body2" color="text.secondary">
          In the mix: {inMix} of {chains.length}, at least {MinVoicesInMix}. A voice&apos;s weight is its share of new
          photos against the other voices in the mix: at 2, twice the photos of a voice at 1.
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Voice</TableCell>
            <TableCell>Tagline</TableCell>
            <TableCell align="right">Captions</TableCell>
            <TableCell>In the mix</TableCell>
            <TableCell align="right">Weight</TableCell>
            <TableCell align="right">Steps</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chains.map((chain) => (
            <React.Fragment key={chain.slug}>
              <TableRow>
                <TableCell>
                  <Box className="flex-normal" sx={{gap: 1}}>
                    <VoiceName name={chain.name} color={chain.color}/>
                    <Chip size="small" variant="outlined" label={chain.slug}/>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{chain.tagline}</Typography>
                </TableCell>
                <TableCell align="right">{chain.captions}</TableCell>
                <TableCell>
                  <Tooltip title={switchHold(chain)}>
                    <span>
                      <Switch
                        size="small"
                        checked={chain.inMix}
                        disabled={busy === chain.slug || switchHold(chain) !== ''}
                        onChange={(event) => toggleMix(chain, event.target.checked)}
                        slotProps={{input: {'aria-label': `${chain.name} in the mix`}}}
                      />
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <WeightCell
                    chain={chain}
                    busy={busy === chain.slug}
                    onSaved={(updated) => setChains((rows) => rows?.map((row) => (row.slug === updated.slug ? updated : row)) ?? null)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box className="flex-normal" sx={{gap: 0.5, justifyContent: 'flex-end'}}>
                    <Typography variant="body2">{SharedSteps + chain.steps.length}</Typography>
                    <ExpandButton
                      open={open === chain.slug}
                      label={`Steps of ${chain.name}`}
                      onClick={() => setOpen(open === chain.slug ? null : chain.slug)}
                    />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{p: 0, border: open === chain.slug ? undefined : 0}}>
                  <Collapse in={open === chain.slug} unmountOnExit>
                    <Box className="flex-column" sx={{gap: 2, p: 2}}>
                      <SharedStepCard step={sharedStep}/>
                      {chain.steps.map((step) => (
                        <StepCard key={step.id} step={step}/>
                      ))}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
