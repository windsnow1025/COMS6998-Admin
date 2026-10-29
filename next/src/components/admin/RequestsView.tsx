import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {AdminConfigControllerFindLlmCallsStepEnum, AdminLlmCallPageResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import {HoverSx} from './HoverSx';
import LlmCallDialog from './LlmCallDialog';
import {useToast} from './Toast';

const PageSize = 20;

type StepFilter = 'all' | AdminConfigControllerFindLlmCallsStepEnum;

// Every request to the LLM, newest first, with its response; a row opens the prompts and the response
export default function RequestsView() {
  const toast = useToast();
  const [page, setPage] = React.useState<AdminLlmCallPageResDto | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [step, setStep] = React.useState<StepFilter>('all');
  const [draft, setDraft] = React.useState('');
  const [q, setQ] = React.useState('');
  const [callId, setCallId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const fetched = await adminClient.fetchLlmCalls(PageSize, pageIndex * PageSize, step === 'all' ? undefined : step, q || undefined);
        if (active) {
          setPage(fetched);
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
  }, [pageIndex, step, q]);

  return (
    <Card variant="outlined" sx={HoverSx}>
      <Box className="flex-between" sx={{p: 2, pb: 1, gap: 2}}>
        <Typography variant="subtitle1">Generation requests</Typography>
        <Box className="flex-normal" sx={{gap: 1}}>
          <TextField
            select
            size="small"
            value={step}
            onChange={(event) => {
              setStep(event.target.value as StepFilter);
              setPageIndex(0);
            }}
            sx={{minWidth: 140}}
            slotProps={{htmlInput: {'aria-label': 'Step'}}}
          >
            <MenuItem value="all">All steps</MenuItem>
            <MenuItem value={AdminConfigControllerFindLlmCallsStepEnum.Describe}>describe</MenuItem>
            <MenuItem value={AdminConfigControllerFindLlmCallsStepEnum.Caption}>caption</MenuItem>
          </TextField>
          <TextField
            size="small"
            placeholder="Search responses"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setQ(draft.trim());
                setPageIndex(0);
              }
            }}
            slotProps={{htmlInput: {maxLength: 160, 'aria-label': 'Search responses'}}}
          />
        </Box>
      </Box>
      {!page ? (
        <Box className="flex-center" sx={{minHeight: 160}}>
          <CircularProgress/>
        </Box>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Step</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Photo</TableCell>
                <TableCell align="right">Tokens in / out</TableCell>
                <TableCell align="right">Time</TableCell>
                <TableCell>Response</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {page.calls.map((call) => (
                <TableRow
                  key={call.id}
                  hover
                  onClick={() => setCallId(call.id)}
                  sx={{cursor: 'pointer'}}
                >
                  <TableCell sx={{whiteSpace: 'nowrap'}}>{formatInstant(call.createdAt)}</TableCell>
                  <TableCell><Chip size="small" color="primary" variant="outlined" label={call.step}/></TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>{call.model}</TableCell>
                  <TableCell>{call.username ?? 'seed'}</TableCell>
                  <TableCell>
                    <Link href={`/photos/${call.imageId}`} onClick={(event) => event.stopPropagation()}>
                      <Box sx={{width: 48, height: 36, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden'}}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={call.imageUrl} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
                      </Box>
                    </Link>
                  </TableCell>
                  <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>{call.inputTokens} / {call.outputTokens}</TableCell>
                  <TableCell align="right">{(call.durationMs / 1000).toFixed(1)}s</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{maxWidth: 360}}>{call.responseExcerpt}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {page.calls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">No call matches.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={page.total}
            page={pageIndex}
            onPageChange={(_event, next) => setPageIndex(next)}
            rowsPerPage={PageSize}
            rowsPerPageOptions={[PageSize]}
          />
        </>
      )}
      <LlmCallDialog callId={callId} onClose={() => setCallId(null)}/>
    </Card>
  );
}
