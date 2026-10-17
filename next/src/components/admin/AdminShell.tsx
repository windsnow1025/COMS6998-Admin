import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {useRouter} from 'next/router';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ColorModeIconDropdown from '@/components/common/shared-theme/ColorModeIconDropdown';
import {StorageKeys} from '@/lib/common/Constants';
import AdminGate, {ViewerContext} from './AdminGate';
import {ToastProvider} from './Toast';

const Sections = [
  {label: 'Overview', href: '/'},
  {label: 'Photos', href: '/photos'},
  {label: 'Users', href: '/users'},
  {label: 'Votes', href: '/votes'},
];

function sectionOf(pathname: string): string {
  const section = Sections.find(
    ({href}) => href !== '/' && pathname.startsWith(href),
  );
  return section?.href ?? '/';
}

function Header() {
  const router = useRouter();
  const viewer = React.useContext(ViewerContext);

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{borderBottom: 1, borderColor: 'divider'}}>
      <Toolbar sx={{gap: 2}}>
        <Box className="flex-center-nowrap" sx={{gap: 1}}>
          <LocalFireDepartmentRoundedIcon color="warning"/>
          <Typography variant="h6" component="span" sx={{whiteSpace: 'nowrap'}}>
            Daily Roast Admin
          </Typography>
        </Box>
        <Tabs
          value={sectionOf(router.pathname)}
          // The shared theme floats each tab 8px above its indicator, which reads
          // off-center inside a toolbar
          sx={{flexGrow: 1, '& .MuiTab-root': {marginBottom: 0}}}
          variant="scrollable"
        >
          {Sections.map(({label, href}) => (
            <Tab key={href} label={label} value={href} href={href} component={Link}/>
          ))}
        </Tabs>
        <Typography variant="body2" color="text.secondary" sx={{display: {xs: 'none', sm: 'block'}}}>
          {viewer?.username}
        </Typography>
        <ColorModeIconDropdown/>
        <Tooltip title="Sign out">
          <IconButton
            aria-label="Sign out"
            onClick={() => {
              localStorage.removeItem(StorageKeys.Token);
              router.push('/signin');
            }}
          >
            <LogoutRoundedIcon/>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

// The frame of every admin page: the sign-in and role gate, the header, and the toast
export default function AdminShell({title, children}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <title>{`${title} | Daily Roast Admin`}</title>
        <meta name="robots" content="noindex"/>
      </Head>
      <ToastProvider>
        <AdminGate>
          <Box className="local-scroll-container">
            <Header/>
            <Box className="local-scroll-scrollable">
              <Container maxWidth="lg" sx={{py: 3}}>
                {children}
              </Container>
            </Box>
          </Box>
        </AdminGate>
      </ToastProvider>
    </>
  );
}
