import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {AdminLlmCallResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatInstant} from '@/lib/admin/Format';
import {useToast} from './Toast';

// One request to the LLM: its step, model, tokens, and time, and the 3 texts, the system prompt, the user prompt, and the response
export default function LlmCallDialog({callId, onClose}: { callId: string | null; onClose: () => void }) {
  const toast = useToast();
  const [loaded, setLoaded] = React.useState<AdminLlmCallResDto | null>(null);
  // The loaded call is kept across a close; it shows only while it is the open one
  const call = loaded && loaded.id === callId ? loaded : null;

  React.useEffect(() => {
    if (!callId) {
      return;
    }
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const fetched = await adminClient.fetchLlmCall(callId);
        if (active) {
          setLoaded(fetched);
        }
      } catch (error) {
        toast.show((error as Error).message, 'error');
        onClose();
      }
    };
    load();
    return () => {
      active = false;
    };
    // toast is stable; onClose only closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  return (
    <Dialog open={callId !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Request and response</DialogTitle>
      <DialogContent>
        {!call ? (
          <Box className="flex-center" sx={{minHeight: 160}}>
            <CircularProgress/>
          </Box>
        ) : (
          <Box className="flex-column" sx={{gap: 2}}>
            <Box className="flex-normal" sx={{gap: 1}}>
              <Chip size="small" label={call.step}/>
              <Chip size="small" label={call.model}/>
              <Chip size="small" label={`${call.inputTokens} in / ${call.outputTokens} out`}/>
              <Chip size="small" label={`${(call.durationMs / 1000).toFixed(1)}s`}/>
              <Chip size="small" label={formatInstant(call.createdAt)}/>
            </Box>
            {([
              ['System prompt', call.systemPrompt],
              ['User prompt', call.userPrompt],
              ['Response', call.response],
            ] as const).map(([label, text]) => (
              <Box key={label}>
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
                    maxHeight: 240,
                    overflow: 'auto',
                  }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
