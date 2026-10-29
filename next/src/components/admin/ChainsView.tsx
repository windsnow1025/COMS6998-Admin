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
import {AdminChainResDto, AdminStepResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

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

// `voice` is the voice's own instruction, shown inside the caption step, whose system prompt carries it
function StepCard({index, step, voice}: {
  index: number;
  step: AdminStepResDto;
  voice?: { slug: string; prompt: string };
}) {
  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2}}>
      <Box className="flex-normal" sx={{gap: 1, mb: 1.5}}>
        <Chip size="small" color="primary" variant="outlined" label={`Step ${index + 1}: ${step.step}`}/>
        <Chip size="small" label={`${step.apiType} · ${step.model}`}/>
        <Chip size="small" label={`temperature ${step.temperature}`}/>
      </Box>
      <Box className="flex-column" sx={{gap: 1.5}}>
        {voice && (
          <PromptBlock label={`Voice instruction, inside this system prompt as <voice name="${voice.slug}">`} text={voice.prompt}/>
        )}
        <PromptBlock label="System prompt" text={step.systemPrompt}/>
        <PromptBlock label="User prompt" text={step.userPrompt}/>
      </Box>
    </Card>
  );
}

// The voices as prompt chains: each row is a voice with its place in the mix; its panel shows the voice's
// instruction and the 2 steps every photo goes through, with the prompts as they run now
export default function ChainsView() {
  const toast = useToast();
  const [chains, setChains] = React.useState<AdminChainResDto[] | null>(null);
  const [open, setOpen] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

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

  const toggleMix = async (chain: AdminChainResDto, inMix: boolean) => {
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

  if (!chains) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  const inMix = chains.filter((chain) => chain.inMix).length;

  return (
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
            <TableCell>In mix</TableCell>
            <TableCell align="right">Steps</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chains.map((chain) => (
            <React.Fragment key={chain.slug}>
              <TableRow>
                <TableCell>
                  <Box className="flex-normal" sx={{gap: 1}}>
                    <Typography variant="body2">{chain.name}</Typography>
                    <Chip size="small" variant="outlined" label={chain.slug}/>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{chain.tagline}</Typography>
                </TableCell>
                <TableCell align="right">{chain.captions}</TableCell>
                <TableCell>
                  <Tooltip title={chain.inMix && inMix <= MinVoicesInMix ? `The mix keeps at least ${MinVoicesInMix} voices` : ''}>
                    <span>
                      <Switch
                        size="small"
                        checked={chain.inMix}
                        disabled={busy === chain.slug || (chain.inMix && inMix <= MinVoicesInMix)}
                        onChange={(event) => toggleMix(chain, event.target.checked)}
                        slotProps={{input: {'aria-label': `${chain.name} in the mix`}}}
                      />
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title={open === chain.slug ? 'Hide the steps' : 'Show the steps'}>
                    <IconButton
                      size="small"
                      aria-label={`Steps of ${chain.name}`}
                      aria-expanded={open === chain.slug}
                      onClick={() => setOpen(open === chain.slug ? null : chain.slug)}
                      sx={{
                        transform: open === chain.slug ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <ExpandMoreRoundedIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} sx={{p: 0, border: open === chain.slug ? undefined : 0}}>
                  <Collapse in={open === chain.slug} unmountOnExit>
                    <Box className="flex-column" sx={{gap: 2, p: 2}}>
                      {chain.steps.map((step, index) => (
                        <StepCard
                          key={step.step}
                          index={index}
                          step={step}
                          voice={step.step === 'caption' ? {slug: chain.slug, prompt: chain.prompt} : undefined}
                        />
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
