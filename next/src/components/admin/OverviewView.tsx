import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {AdminOverviewResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import DayChart from './DayChart';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

function StatTile({label, value, warn, basis = 140}: {
  label: string;
  value: number;
  warn?: boolean;
  // Widened for a label that would wrap at the tile's minimum width
  basis?: number;
}) {
  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2, flex: `1 1 ${basis}px`}}>
      <Typography variant="h5" color={warn && value > 0 ? 'error' : 'text.primary'}>
        {value.toLocaleString('en-US')}
      </Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Card>
  );
}

export default function OverviewView() {
  const toast = useToast();
  const [overview, setOverview] = React.useState<AdminOverviewResDto | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        setOverview(await adminClient.fetchOverview());
      } catch (error) {
        toast.show((error as Error).message, 'error');
      }
    };
    load();
    // toast is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!overview) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  const {totals, days, voices, llmSteps} = overview;

  return (
    <Box className="flex-column" sx={{gap: 3}}>
      <Box className="flex-normal" sx={{gap: 2}}>
        <StatTile label="Users" value={totals.users}/>
        <StatTile label="Photos" value={totals.photos}/>
        <StatTile label="Captions" value={totals.captions}/>
        <StatTile label="Picks" value={totals.picks}/>
        <StatTile label="Batches" value={totals.batches}/>
        <StatTile label="LLM calls" value={totals.llmCalls}/>
        <StatTile label="Uncaptioned photos" value={totals.photosWithoutCaptions} warn basis={180}/>
      </Box>

      <Card variant="outlined" sx={{...HoverSx, p: 2}}>
        <Typography variant="subtitle1" sx={{mb: 1}}>
          Votes, last {days.length} days
        </Typography>
        <DayChart days={days}/>
      </Card>

      <Box className="flex-start-start" sx={{gap: 3}}>
        <Card variant="outlined" sx={{...HoverSx, flex: '1 1 360px'}}>
          <Typography variant="subtitle1" sx={{p: 2, pb: 0}}>
            Voices
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Voice</TableCell>
                <TableCell align="right">Captions</TableCell>
                <TableCell align="right">Picks</TableCell>
                <TableCell align="right">Downs</TableCell>
                <TableCell align="right">Pick rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voices.map((voice) => (
                <TableRow key={voice.slug}>
                  <TableCell>{voice.name}</TableCell>
                  <TableCell align="right">{voice.captions}</TableCell>
                  <TableCell align="right">{voice.picks}</TableCell>
                  <TableCell align="right">{voice.downs}</TableCell>
                  <TableCell align="right">
                    {voice.picks + voice.downs > 0
                      ? `${Math.round((voice.picks / (voice.picks + voice.downs)) * 100)}%`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card variant="outlined" sx={{...HoverSx, flex: '1 1 360px'}}>
          <Typography variant="subtitle1" sx={{p: 2, pb: 0}}>
            LLM steps
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Step</TableCell>
                <TableCell align="right">Calls</TableCell>
                <TableCell align="right">Tokens in</TableCell>
                <TableCell align="right">Tokens out</TableCell>
                <TableCell align="right">Avg time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {llmSteps.map((step) => (
                <TableRow key={step.step}>
                  <TableCell>{step.step}</TableCell>
                  <TableCell align="right">{step.calls}</TableCell>
                  <TableCell align="right">{step.inputTokens.toLocaleString('en-US')}</TableCell>
                  <TableCell align="right">{step.outputTokens.toLocaleString('en-US')}</TableCell>
                  <TableCell align="right">{(step.averageDurationMs / 1000).toFixed(1)}s</TableCell>
                </TableRow>
              ))}
              {llmSteps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">No calls yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Box>
    </Box>
  );
}
