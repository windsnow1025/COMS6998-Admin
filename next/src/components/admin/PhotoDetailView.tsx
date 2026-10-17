import * as React from 'react';
import {useRouter} from 'next/router';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  AdminCaptionResDto,
  AdminLlmCallResDto,
  AdminPhotoDetailResDto,
} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatDate, formatInstant} from '@/lib/admin/Format';
import ConfirmDialog from './ConfirmDialog';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

// A photo's captions carry 3 voices once generation has finished
const FullCaptionCount = 3;

function LlmCallDialog({callId, onClose}: { callId: string | null; onClose: () => void }) {
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
      <DialogTitle>LLM call</DialogTitle>
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

function CaptionCard({caption, onChanged}: {
  caption: AdminCaptionResDto;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(caption.content);
  const [deleting, setDeleting] = React.useState(false);
  const [callId, setCallId] = React.useState<string | null>(null);

  const save = async () => {
    const adminClient = new AdminClient();
    try {
      await adminClient.updateCaption(caption.id, draft);
      toast.show('Caption updated.', 'success');
      setEditing(false);
      onChanged();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
  };

  const remove = async () => {
    const adminClient = new AdminClient();
    try {
      await adminClient.deleteCaption(caption.id);
      toast.show('Caption deleted.', 'success');
      setDeleting(false);
      onChanged();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
  };

  return (
    <Card variant="outlined" sx={{...HoverSx, p: 2}}>
      <Box className="flex-between" sx={{gap: 1, mb: 1}}>
        <Box className="flex-normal" sx={{gap: 1}}>
          <Chip size="small" color="primary" variant="outlined" label={caption.flavor?.name ?? 'no voice'}/>
          <Chip size="small" label={`${caption.picks} picks`}/>
          <Chip size="small" label={`${caption.downs} downs`}/>
        </Box>
        <Box className="flex-normal" sx={{gap: 0.5}}>
          {caption.llmCallId && (
            <Button size="small" onClick={() => setCallId(caption.llmCallId)}>
              Prompts
            </Button>
          )}
          <Tooltip title="Edit">
            <IconButton size="small" aria-label="Edit caption" onClick={() => setEditing(true)}>
              <EditRoundedIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" aria-label="Delete caption" onClick={() => setDeleting(true)}>
              <DeleteRoundedIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {editing ? (
        <Box className="flex-column" sx={{gap: 1}}>
          <TextField
            multiline
            fullWidth
            size="small"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            slotProps={{htmlInput: {maxLength: 160}}}
          />
          <Box className="flex-end-center" sx={{gap: 1}}>
            <Button size="small" onClick={() => {
              setDraft(caption.content);
              setEditing(false);
            }}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={save} disabled={!draft.trim()}>
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1">{caption.content}</Typography>
      )}

      <ConfirmDialog
        open={deleting}
        title="Delete this caption?"
        body="Its votes go with it. A deleted caption cannot be restored."
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleting(false)}
      />
      <LlmCallDialog callId={callId} onClose={() => setCallId(null)}/>
    </Card>
  );
}

export default function PhotoDetailView({id}: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [photo, setPhoto] = React.useState<AdminPhotoDetailResDto | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [writing, setWriting] = React.useState(false);
  const [generation, setGeneration] = React.useState(0);
  const reload = () => setGeneration((count) => count + 1);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const fetched = await adminClient.fetchPhoto(id);
        if (active) {
          setPhoto(fetched);
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
  }, [id, generation]);

  if (!photo) {
    return (
      <Box className="flex-center" sx={{minHeight: '50vh'}}>
        <CircularProgress/>
      </Box>
    );
  }

  const removePhoto = async () => {
    const adminClient = new AdminClient();
    try {
      await adminClient.deletePhoto(photo.id);
      toast.show('Photo deleted.', 'success');
      router.replace('/photos');
    } catch (error) {
      toast.show((error as Error).message, 'error');
      setDeleting(false);
    }
  };

  const writeCaptions = async () => {
    setWriting(true);
    const adminClient = new AdminClient();
    try {
      await adminClient.writeCaptions(photo.id);
      toast.show('Captions written.', 'success');
      reload();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setWriting(false);
  };

  return (
    <Box className="flex-start-start" sx={{gap: 3}}>
      <Box className="flex-column" sx={{gap: 2, flex: '1 1 320px', minWidth: 280}}>
        <Card variant="outlined" sx={{...HoverSx, overflow: 'hidden'}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.description} style={{width: '100%', display: 'block'}}/>
          <Box className="flex-column" sx={{p: 2, gap: 1}}>
            <Typography variant="body2">{photo.description}</Typography>
            <Typography variant="body2" color="text.secondary">
              {photo.uploader ? `Uploaded by ${photo.uploader.username}` : 'Seed photo'}
              {photo.place ? ` · ${photo.place}` : ''}
              {` · ${formatInstant(photo.createdAt)}`}
            </Typography>
            <Box className="flex-normal" sx={{gap: 1}}>
              {photo.batchDates.length === 0 ? (
                <Chip size="small" label="Not served yet"/>
              ) : (
                photo.batchDates.map((date) => (
                  <Chip key={date} size="small" label={formatDate(date)}/>
                ))
              )}
            </Box>
            <Box className="flex-end-center">
              <Button
                color="error"
                startIcon={<DeleteRoundedIcon/>}
                onClick={() => setDeleting(true)}
              >
                Delete photo
              </Button>
            </Box>
          </Box>
        </Card>

        <Card variant="outlined" sx={HoverSx}>
          <Typography variant="subtitle1" sx={{p: 2, pb: 0}}>
            Votes
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Vote</TableCell>
                <TableCell>When</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {photo.votes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>{vote.user.username}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={vote.value > 0 ? 'success' : 'default'}
                      label={vote.value > 0 ? 'pick' : 'down'}
                    />
                  </TableCell>
                  <TableCell>{formatInstant(vote.createdAt)}</TableCell>
                </TableRow>
              ))}
              {photo.votes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">No votes yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </Box>

      <Box className="flex-column" sx={{gap: 2, flex: '1 1 380px', minWidth: 300}}>
        <Box className="flex-between">
          <Typography variant="subtitle1">
            Captions
          </Typography>
          {photo.captions.length < FullCaptionCount && (
            <Button variant="contained" onClick={writeCaptions} disabled={writing}>
              {writing ? 'Writing…' : 'Write captions'}
            </Button>
          )}
        </Box>
        {photo.captions.map((caption) => (
          <CaptionCard key={caption.id} caption={caption} onChanged={reload}/>
        ))}
        {photo.captions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No captions. The generation failed or was never run; write them from here.
          </Typography>
        )}
      </Box>

      <ConfirmDialog
        open={deleting}
        title="Delete this photo?"
        body="Its captions and votes go with it, and its file leaves storage."
        confirmLabel="Delete"
        onConfirm={removePhoto}
        onClose={() => setDeleting(false)}
      />
    </Box>
  );
}
