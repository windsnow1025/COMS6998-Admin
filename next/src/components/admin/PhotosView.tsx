import * as React from 'react';
import {useRouter} from 'next/router';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {AdminPhotoPageResDto} from '@/client/nest';
import AdminClient from '@/lib/admin/AdminClient';
import {formatDate, formatInstant, truncate} from '@/lib/admin/Format';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

const RowsPerPage = 20;

function SeedDialog({open, onClose, onStored}: {
  open: boolean;
  onClose: () => void;
  onStored: (photoId: string) => void;
}) {
  const toast = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [place, setPlace] = React.useState('');
  const [storing, setStoring] = React.useState(false);

  const store = async () => {
    if (!file) {
      return;
    }
    setStoring(true);
    const adminClient = new AdminClient();
    try {
      const photo = await adminClient.createSeedPhoto(file, place.trim() || undefined);
      toast.show('Photo stored. Write its captions next.', 'success');
      onStored(photo.id);
    } catch (error) {
      toast.show((error as Error).message, 'error');
      setStoring(false);
    }
  };

  return (
    <Dialog open={open} onClose={storing ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Seed photo</DialogTitle>
      <DialogContent className="flex-column" sx={{gap: 2}}>
        <Typography variant="body2" color="text.secondary">
          A seed photo has no uploader. It is described on upload; write its captions
          from its page afterwards.
        </Typography>
        <Button variant="outlined" component="label">
          {file ? file.name : 'Choose a photo'}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </Button>
        <TextField
          label="Place (optional)"
          value={place}
          onChange={(event) => setPlace(event.target.value)}
          slotProps={{htmlInput: {maxLength: 80}}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={storing}>Cancel</Button>
        <Button variant="contained" onClick={store} disabled={!file || storing}>
          {storing ? 'Storing…' : 'Store'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PhotosView() {
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [result, setResult] = React.useState<AdminPhotoPageResDto | null>(null);
  const [seedOpen, setSeedOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      const adminClient = new AdminClient();
      try {
        const photos = await adminClient.fetchPhotos(
          RowsPerPage,
          page * RowsPerPage,
          search || undefined,
        );
        if (active) {
          setResult(photos);
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
  }, [page, search]);

  return (
    <Box className="flex-column" sx={{gap: 2}}>
      <Box className="flex-between" sx={{gap: 2}}>
        <TextField
          size="small"
          placeholder="Search descriptions, places, captions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setPage(0);
              setSearch(query.trim());
            }
          }}
          sx={{width: 320}}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small"/>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateRoundedIcon/>}
          onClick={() => setSeedOpen(true)}
        >
          Seed photo
        </Button>
      </Box>

      {!result ? (
        <Box className="flex-center" sx={{minHeight: '40vh'}}>
          <CircularProgress/>
        </Box>
      ) : (
        <Card variant="outlined" sx={HoverSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell>Stored</TableCell>
                <TableCell>Latest batch</TableCell>
                <TableCell align="right">Captions</TableCell>
                <TableCell align="right">Voters</TableCell>
                <TableCell align="right">Picks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.photos.map((photo) => (
                <TableRow
                  key={photo.id}
                  hover
                  sx={{cursor: 'pointer'}}
                  onClick={() => router.push(`/photos/${photo.id}`)}
                >
                  <TableCell sx={{width: 72}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt=""
                      width={56}
                      height={42}
                      style={{objectFit: 'cover', borderRadius: 4, display: 'block'}}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{truncate(photo.description, 90)}</Typography>
                    {photo.place && (
                      <Typography variant="caption" color="text.secondary">{photo.place}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{photo.uploader?.username ?? 'seed'}</TableCell>
                  <TableCell>{formatInstant(photo.createdAt)}</TableCell>
                  <TableCell>
                    {photo.latestBatchDate ? formatDate(photo.latestBatchDate) : 'waiting'}
                  </TableCell>
                  <TableCell align="right">{photo.captions}</TableCell>
                  <TableCell align="right">{photo.voters}</TableCell>
                  <TableCell align="right">{photo.picks}</TableCell>
                </TableRow>
              ))}
              {result.photos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                      No photo matches.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={result.total}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={RowsPerPage}
            rowsPerPageOptions={[RowsPerPage]}
          />
        </Card>
      )}

      <SeedDialog
        open={seedOpen}
        onClose={() => setSeedOpen(false)}
        onStored={(photoId) => router.push(`/photos/${photoId}`)}
      />
    </Box>
  );
}
