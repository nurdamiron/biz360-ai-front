import React from 'react';
import { SnackbarProvider as NotistackProvider } from 'notistack';
import { useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const theme = useTheme();
  const notistackRef = React.createRef<NotistackProvider>();
  
  const onClickDismiss = (key: string | number) => {
    notistackRef.current?.closeSnackbar(key);
  };

  return (
    <NotistackProvider
      ref={notistackRef}
      maxSnack={3}
      autoHideDuration={5000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      action={(key) => (
        <IconButton 
          size="small" 
          onClick={() => onClickDismiss(key)}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      )}
      sx={{
        '& .SnackbarContent-root': {
          [theme.breakpoints.down('sm')]: {
            margin: theme.spacing(1),
            width: 'calc(100% - 16px)',
            maxWidth: 'calc(100% - 16px)',
          },
        },
        // Стили для разных типов уведомлений
        '& .SnackbarItem-variantSuccess': {
          backgroundColor: theme.palette.success.main,
        },
        '& .SnackbarItem-variantError': {
          backgroundColor: theme.palette.error.main,
        },
        '& .SnackbarItem-variantWarning': {
          backgroundColor: theme.palette.warning.main,
        },
        '& .SnackbarItem-variantInfo': {
          backgroundColor: theme.palette.info.main,
        },
      }}
    >
      {children}
    </NotistackProvider>
  );
};

export default NotificationProvider;