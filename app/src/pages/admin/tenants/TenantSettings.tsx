import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  Switch,
  Select,
  Option,
  Textarea,
  ColorPicker,
} from '@mui/joy';
import { Save as SaveIcon } from '@mui/icons-material';

interface TenantSettings {
  name: string;
  subdomain: string;
  settings: {
    businessHours: {
      start: string;
      end: string;
      workingDays: string[];
    };
    appointmentDuration: number;
    currency: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  customization: {
    logo: string;
    favicon: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
    layout: {
      sidebarPosition: string;
      theme: string;
    };
  };
  features: {
    insurance: boolean;
    onlineBooking: boolean;
    smsReminders: boolean;
    analytics: boolean;
    multipleLocations: boolean;
    patientPortal: boolean;
    teledentistry: boolean;
    inventory: boolean;
  };
  security: {
    mfa: boolean;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
      expiryDays: number;
    };
    ipWhitelist: string[];
    sessionTimeout: number;
  };
}

export default function TenantSettings() {
  const { id } = useParams<{ id: string }>();
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/admin/tenants/${id}/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`/api/admin/tenants/${id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    }
  };

  if (loading || !settings) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="h4">Tenant Settings</Typography>
        <Button
          startDecorator={<SaveIcon />}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      <Card>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <TabList>
            <Tab>General</Tab>
            <Tab>Customization</Tab>
            <Tab>Features</Tab>
            <Tab>Security</Tab>
          </TabList>

          <TabPanel value={0}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Tenant Name</FormLabel>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Subdomain</FormLabel>
                <Input
                  value={settings.subdomain}
                  onChange={(e) => setSettings({ ...settings, subdomain: e.target.value })}
                />
              </FormControl>

              <Divider>Business Hours</Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={settings.settings.businessHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        businessHours: {
                          ...settings.settings.businessHours,
                          start: e.target.value,
                        },
                      },
                    })}
                  />
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={settings.settings.businessHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      settings: {
                        ...settings.settings,
                        businessHours: {
                          ...settings.settings.businessHours,
                          end: e.target.value,
                        },
                      },
                    })}
                  />
                </FormControl>
              </Box>

              <FormControl>
                <FormLabel>Appointment Duration (minutes)</FormLabel>
                <Input
                  type="number"
                  value={settings.settings.appointmentDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      appointmentDuration: parseInt(e.target.value),
                    },
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Currency</FormLabel>
                <Select
                  value={settings.settings.currency}
                  onChange={(_, value) => setSettings({
                    ...settings,
                    settings: {
                      ...settings.settings,
                      currency: value || 'USD',
                    },
                  })}
                >
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="GBP">GBP (£)</Option>
                </Select>
              </FormControl>
            </Stack>
          </TabPanel>

          <TabPanel value={1}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Logo URL</FormLabel>
                <Input
                  value={settings.customization.logo}
                  onChange={(e) => setSettings({
                    ...settings,
                    customization: {
                      ...settings.customization,
                      logo: e.target.value,
                    },
                  })}
                />
              </FormControl>

              <Divider>Colors</Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Primary Color</FormLabel>
                  <ColorPicker
                    value={settings.customization.colors.primary}
                    onChange={(value) => setSettings({
                      ...settings,
                      customization: {
                        ...settings.customization,
                        colors: {
                          ...settings.customization.colors,
                          primary: value,
                        },
                      },
                    })}
                  />
                </FormControl>

                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Secondary Color</FormLabel>
                  <ColorPicker
                    value={settings.customization.colors.secondary}
                    onChange={(value) => setSettings({
                      ...settings,
                      customization: {
                        ...settings.customization,
                        colors: {
                          ...settings.customization.colors,
                          secondary: value,
                        },
                      },
                    })}
                  />
                </FormControl>
              </Box>

              <FormControl>
                <FormLabel>Theme</FormLabel>
                <Select
                  value={settings.customization.layout.theme}
                  onChange={(_, value) => setSettings({
                    ...settings,
                    customization: {
                      ...settings.customization,
                      layout: {
                        ...settings.customization.layout,
                        theme: value || 'light',
                      },
                    },
                  })}
                >
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="system">System</Option>
                </Select>
              </FormControl>
            </Stack>
          </TabPanel>

          <TabPanel value={2}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Features</FormLabel>
                <Stack spacing={1}>
                  {Object.entries(settings.features).map(([key, value]) => (
                    <Box
                      key={key}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography>{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                      <Switch
                        checked={value}
                        onChange={(e) => setSettings({
                          ...settings,
                          features: {
                            ...settings.features,
                            [key]: e.target.checked,
                          },
                        })}
                      />
                    </Box>
                  ))}
                </Stack>
              </FormControl>
            </Stack>
          </TabPanel>

          <TabPanel value={3}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Multi-Factor Authentication</FormLabel>
                <Switch
                  checked={settings.security.mfa}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      mfa: e.target.checked,
                    },
                  })}
                />
              </FormControl>

              <Divider>Password Policy</Divider>

              <FormControl>
                <FormLabel>Minimum Length</FormLabel>
                <Input
                  type="number"
                  value={settings.security.passwordPolicy.minLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      passwordPolicy: {
                        ...settings.security.passwordPolicy,
                        minLength: parseInt(e.target.value),
                      },
                    },
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password Requirements</FormLabel>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Require Numbers</Typography>
                    <Switch
                      checked={settings.security.passwordPolicy.requireNumbers}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireNumbers: e.target.checked,
                          },
                        },
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>Require Symbols</Typography>
                    <Switch
                      checked={settings.security.passwordPolicy.requireSymbols}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: {
                            ...settings.security.passwordPolicy,
                            requireSymbols: e.target.checked,
                          },
                        },
                      })}
                    />
                  </Box>
                </Stack>
              </FormControl>

              <FormControl>
                <FormLabel>IP Whitelist</FormLabel>
                <Textarea
                  minRows={3}
                  placeholder="Enter IP addresses (one per line)"
                  value={settings.security.ipWhitelist.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      ipWhitelist: e.target.value.split('\n').filter(Boolean),
                    },
                  })}
                />
              </FormControl>
            </Stack>
          </TabPanel>
        </Tabs>
      </Card>
    </Box>
  );
} 