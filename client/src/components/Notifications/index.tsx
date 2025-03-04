import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar, Stack } from '@mui/material';
import { RootState } from '@store/index';
import { removeNotification } from '@store/slices/uiSlice';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notifications[0].id));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Notifications; 