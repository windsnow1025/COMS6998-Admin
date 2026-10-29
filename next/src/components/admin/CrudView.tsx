import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ConfirmDialog from './ConfirmDialog';
import {HoverSx} from './HoverSx';
import {useToast} from './Toast';

export type CrudValues = Record<string, string | boolean>;

export interface CrudColumn<T> {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
}

export interface CrudField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'switch';
  options?: { value: string; label: string }[];
  required?: boolean;
  maxLength?: number;
  helper?: string;
  // Set at creation only; the edit dialog shows it disabled
  createOnly?: boolean;
}

interface CrudViewProps<T> {
  title: string;
  // One line under the title, where the table alone does not say what the rows do
  description?: string;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  rowKey: (row: T) => string;
  // The field values of a row, for the edit dialog
  toValues: (row: T) => CrudValues;
  load: () => Promise<T[]>;
  create: (values: CrudValues) => Promise<unknown>;
  update: (row: T, values: CrudValues) => Promise<unknown>;
  remove: (row: T) => Promise<unknown>;
  noun: string;
  emptyText: string;
  // What a deletion takes with it, shown in the confirmation
  deleteBody: string;
}

function emptyValues(fields: CrudField[]): CrudValues {
  return Object.fromEntries(fields.map((field) => [field.key, field.type === 'switch' ? true : '']));
}

// A table of one kind of row with add, edit, and delete; the dialog's fields come from `fields`
export default function CrudView<T>(props: CrudViewProps<T>) {
  const {title, description, columns, fields, rowKey, toValues, load, create, update, remove, noun, emptyText, deleteBody} = props;
  const toast = useToast();
  const [rows, setRows] = React.useState<T[] | null>(null);
  const [generation, setGeneration] = React.useState(0);
  const [editing, setEditing] = React.useState<{ row: T | null } | null>(null);
  const [values, setValues] = React.useState<CrudValues>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState<T | null>(null);
  const reload = () => setGeneration((count) => count + 1);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const loaded = await load();
        if (active) {
          setRows(loaded);
        }
      } catch (error) {
        toast.show((error as Error).message, 'error');
      }
    };
    run();
    return () => {
      active = false;
    };
    // toast is stable; load is given once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generation]);

  const openAdd = () => {
    setValues(emptyValues(fields));
    setEditing({row: null});
  };

  const openEdit = (row: T) => {
    setValues(toValues(row));
    setEditing({row});
  };

  const complete = fields.every((field) => !field.required || field.type === 'switch' || String(values[field.key] ?? '').trim());

  const save = async () => {
    if (!editing) {
      return;
    }
    setSaving(true);
    try {
      if (editing.row === null) {
        await create(values);
        toast.show(`${capitalize(noun)} added.`, 'success');
      } else {
        await update(editing.row, values);
        toast.show(`${capitalize(noun)} updated.`, 'success');
      }
      setEditing(null);
      reload();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleting) {
      return;
    }
    try {
      await remove(deleting);
      toast.show(`${capitalize(noun)} deleted.`, 'success');
      setDeleting(null);
      reload();
    } catch (error) {
      toast.show((error as Error).message, 'error');
    }
  };

  return (
    <Card variant="outlined" sx={HoverSx}>
      <Box className="flex-between" sx={{p: 2, pb: 1, gap: 2}}>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography variant="subtitle1">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">{description}</Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon/>} onClick={openAdd} sx={{flexShrink: 0}}>
          Add {noun}
        </Button>
      </Box>
      {rows === null ? (
        <Box className="flex-center" sx={{minHeight: 120}}>
          <CircularProgress/>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align}>{column.label}</TableCell>
              ))}
              <TableCell align="right"/>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>{column.render(row)}</TableCell>
                ))}
                <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>
                  <Tooltip title="Edit">
                    <IconButton size="small" aria-label={`Edit ${noun}`} onClick={() => openEdit(row)}>
                      <EditRoundedIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" aria-label={`Delete ${noun}`} onClick={() => setDeleting(row)}>
                      <DeleteRoundedIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>{editing?.row === null ? `Add ${noun}` : `Edit ${noun}`}</DialogTitle>
        <DialogContent>
          <Box className="flex-column" sx={{gap: 2, pt: 1}}>
            {fields.map((field) => {
              const value = values[field.key];
              if (field.type === 'switch') {
                return (
                  <FormControlLabel
                    key={field.key}
                    control={
                      <Switch
                        checked={value === true}
                        onChange={(event) => setValues({...values, [field.key]: event.target.checked})}
                      />
                    }
                    label={field.label}
                  />
                );
              }
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={String(value ?? '')}
                  onChange={(event) => setValues({...values, [field.key]: event.target.value})}
                  select={field.type === 'select'}
                  multiline={field.type === 'textarea'}
                  minRows={field.type === 'textarea' ? 3 : undefined}
                  required={field.required}
                  disabled={editing?.row !== null && field.createOnly === true}
                  helperText={field.helper}
                  fullWidth
                  slotProps={{htmlInput: {maxLength: field.maxLength}}}
                >
                  {field.type === 'select' && field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving || !complete}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete this ${noun}?`}
        body={deleteBody}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </Card>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
