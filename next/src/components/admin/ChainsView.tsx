import * as React from 'react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {AdminScreeningResDto, ChainResDto, StepResDto, StepResDtoInputEnum} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';
import VoiceName from './VoiceName';

function PromptBlock({label, text}: { label: string; text: string }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Typography
        variant="body2"
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'inherit',
          bgcolor: 'action.hover',
          borderRadius: 1,
          p: 1.5,
          m: 0,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

const MinVoicesInMix = 3;
// The rules of the mix, in the API's words
const MixNeedsCaptions = 'A chain in the mix ends with a step that writes captions';
const MixKeepsMinimum = `The mix keeps at least ${MinVoicesInMix} voices`;

// A chevron that opens and closes a panel
function ExpandButton({open, label, disabled, onClick}: {
  open: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip title={open ? 'Hide the prompts' : 'Show the prompts'}>
      <span>
        <IconButton
          size="small"
          aria-label={label}
          aria-expanded={open}
          disabled={disabled}
          onClick={onClick}
          sx={{transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}
        >
          <ExpandMoreRoundedIcon fontSize="small"/>
        </IconButton>
      </span>
    </Tooltip>
  );
}

// The product's own step before any chain, with its prompts behind the chevron like a chain's steps
function ScreeningCard({screening}: { screening: AdminScreeningResDto }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Card variant="outlined" sx={HoverSx}>
      <Box className="flex-between" sx={{p: 2, pb: 1, gap: 2}}>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography variant="subtitle1">Screening</Typography>
          <Typography variant="body2" color="text.secondary">
            Screens the photo and writes the description a chain reads as {'{description}'}.
          </Typography>
        </Box>
        <ExpandButton open={open} label="Prompts of the screening" onClick={() => setOpen(!open)}/>
      </Box>
      <Box sx={{p: 2, pt: 1}}>
        <Box className="flex-normal" sx={{gap: 1}}>
          <Chip size="small" color="primary" variant="outlined" label={screening.step}/>
          <Chip size="small" label="photo in"/>
          <Chip size="small" label="text out"/>
          <Chip size="small" label={`${screening.apiType} · ${screening.model}`}/>
          <Chip size="small" label={`temperature ${screening.temperature}`}/>
        </Box>
        <Collapse in={open} unmountOnExit>
          <Box className="flex-column" sx={{gap: 1.5, mt: 1.5}}>
            <PromptBlock label="System prompt" text={screening.systemPrompt}/>
            <PromptBlock label="User prompt" text={screening.userPrompt}/>
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
}

function StepCard({step}: { step: StepResDto }) {
  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2}}>
      <Box className="flex-normal" sx={{gap: 1, mb: 1.5}}>
        <Chip size="small" color="primary" variant="outlined" label={`Step ${step.position + 1}: ${step.name}`}/>
        <Chip size="small" label={step.input === StepResDtoInputEnum.Image ? 'photo in' : 'text in'}/>
        <Chip size="small" label={`${step.output} out`}/>
        <Chip size="small" label={`${step.apiType} · ${step.model}`}/>
        <Chip size="small" label={`temperature ${step.temperature}`}/>
      </Box>
      <Box className="flex-column" sx={{gap: 1.5}}>
        <PromptBlock label="System prompt" text={step.systemPrompt}/>
        <PromptBlock label="User prompt" text={step.userPrompt}/>
      </Box>
    </Card>
  );
}

// The voices as prompt chains: each row is a voice with its place in the mix, and its panel shows its steps with
// their prompts as the chain tool holds them
export default function ChainsView() {
  const toast = useToast();
  const [chains, setChains] = React.useState<ChainResDto[] | null>(null);
  const [screening, setScreening] = React.useState<AdminScreeningResDto | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const [fetchedChains, fetchedScreening] = await Promise.all([adminClient.fetchChains(), adminClient.fetchScreening()]);
        if (active) {
          setChains(fetchedChains);
          setScreening(fetchedScreening);
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
      const updated = await adminClient.updateChain(chain.slug, inMix);
      setChains((rows) => rows?.map((row) => (row.slug === updated.slug ? updated : row)) ?? null);
      toast.show(inMix ? `${chain.name} is in the mix.` : `${chain.name} is out of the mix.`, 'success');
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setBusy(null);
  };

  if (!chains || !screening) {
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
    <Box className="flex-column" sx={{gap: 3}}>
      <ScreeningCard screening={screening}/>
      <Card variant="outlined" sx={HoverSx}>
        <Box sx={{p: 2, pb: 1}}>
          <Typography variant="subtitle1">Prompt chains</Typography>
          <Typography variant="body2" color="text.secondary">
            In the mix: {inMix} of {chains.length}, at least {MinVoicesInMix}.
          </Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Voice</TableCell>
              <TableCell>Tagline</TableCell>
              <TableCell align="right">Captions</TableCell>
              <TableCell>In the mix</TableCell>
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
                    <Box className="flex-normal" sx={{gap: 0.5, justifyContent: 'flex-end'}}>
                      <Typography variant="body2">{chain.steps.length}</Typography>
                      <ExpandButton
                        open={open === chain.slug}
                        label={`Steps of ${chain.name}`}
                        disabled={chain.steps.length === 0}
                        onClick={() => setOpen(open === chain.slug ? null : chain.slug)}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{p: 0, border: open === chain.slug ? undefined : 0}}>
                    <Collapse in={open === chain.slug} unmountOnExit>
                      <Box className="flex-column" sx={{gap: 2, p: 2}}>
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
    </Box>
  );
}
