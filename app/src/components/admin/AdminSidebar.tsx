import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  Sheet,
  Typography,
} from '@mui/joy';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const menuItems = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    path: '/admin/tenants',
    label: 'Tenants',
    icon: <BusinessIcon />,
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    children: [
      {
        path: '/admin/settings',
        label: 'System Settings',
        icon: <SecurityIcon />,
      },
      {
        path: '/admin/settings/payment-gateways',
        label: 'Payment Gateways',
        icon: <PaymentIcon />,
      },
      {
        path: '/admin/settings/audit-logs',
        label: 'Audit Logs',
        icon: <AssessmentIcon />,
      },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);

  const handleSubmenuClick = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet
      sx={{
        width: 280,
        p: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography level="h4" component="h1">
        Admin Panel
      </Typography>

      <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.children ? (
              <>
                <ListItem>
                  <ListItemButton
                    selected={openSubmenu === item.label}
                    onClick={() => handleSubmenuClick(item.label)}
                  >
                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                    <ListItemContent>{item.label}</ListItemContent>
                  </ListItemButton>
                </ListItem>
                {openSubmenu === item.label && (
                  <List sx={{ pl: 3 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.path}>
                        <ListItemButton
                          component={Link}
                          to={child.path}
                          selected={isActive(child.path)}
                        >
                          <ListItemDecorator>{child.icon}</ListItemDecorator>
                          <ListItemContent>{child.label}</ListItemContent>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <ListItem>
                <ListItemButton
                  component={Link}
                  to={item.path!}
                  selected={isActive(item.path!)}
                >
                  <ListItemDecorator>{item.icon}</ListItemDecorator>
                  <ListItemContent>{item.label}</ListItemContent>
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </Sheet>
  );
} 