import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  Switch,
  Select,
  Option,
  Alert,
} from '@mui/joy';
import { Save as SaveIcon } from '@mui/icons-material';

interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  config: {
    [key: string]: string;
  };
}

interface GatewayConfig {
  stripe: {
    secretKey: string;
    webhookSecret: string;
    enableTestMode: boolean;
  };
  lemonsqueezy: {
    apiKey: string;
    storeId: string;
    webhookSecret: string;
  };
  paddle: {
    vendorId: string;
    apiKey: string;
    publicKey: string;
  };
  chargebee: {
    siteApiKey: string;
    siteName: string;
    gateway: string;
  };
}

export default function PaymentGateways() {
  const [gateways, setGateways] = useState<GatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const response = await fetch('/api/admin/settings/payment-gateways');
      const data = await response.json();
      setGateways(data);
    } catch (error) {
      setError('Failed to load payment gateway settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateways),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccess('Payment gateway settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Failed to save payment gateway settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !gateways) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="h4">Payment Gateway Settings</Typography>
        <Button
          startDecorator={<SaveIcon />}
          onClick={handleSave}
          loading={saving}
        >
          Save Changes
        </Button>
      </Box>

      {error && (
        <Alert color="danger" variant="soft">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="success" variant="soft">
          {success}
        </Alert>
      )}

      <Card>
        <Stack spacing={3}>
          {/* Stripe Configuration */}
          <Box>
            <Typography level="title-lg">Stripe</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Secret Key</FormLabel>
                <Input
                  type="password"
                  value={gateways.stripe.secretKey}
                  onChange={(e) => setGateways({
                    ...gateways,
                    stripe: { ...gateways.stripe, secretKey: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Webhook Secret</FormLabel>
                <Input
                  type="password"
                  value={gateways.stripe.webhookSecret}
                  onChange={(e) => setGateways({
                    ...gateways,
                    stripe: { ...gateways.stripe, webhookSecret: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Test Mode</FormLabel>
                <Switch
                  checked={gateways.stripe.enableTestMode}
                  onChange={(e) => setGateways({
                    ...gateways,
                    stripe: { ...gateways.stripe, enableTestMode: e.target.checked },
                  })}
                />
              </FormControl>
            </Stack>
          </Box>

          {/* LemonSqueezy Configuration */}
          <Box>
            <Typography level="title-lg">LemonSqueezy</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>API Key</FormLabel>
                <Input
                  type="password"
                  value={gateways.lemonsqueezy.apiKey}
                  onChange={(e) => setGateways({
                    ...gateways,
                    lemonsqueezy: { ...gateways.lemonsqueezy, apiKey: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Store ID</FormLabel>
                <Input
                  value={gateways.lemonsqueezy.storeId}
                  onChange={(e) => setGateways({
                    ...gateways,
                    lemonsqueezy: { ...gateways.lemonsqueezy, storeId: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Webhook Secret</FormLabel>
                <Input
                  type="password"
                  value={gateways.lemonsqueezy.webhookSecret}
                  onChange={(e) => setGateways({
                    ...gateways,
                    lemonsqueezy: { ...gateways.lemonsqueezy, webhookSecret: e.target.value },
                  })}
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Paddle Configuration */}
          <Box>
            <Typography level="title-lg">Paddle</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Vendor ID</FormLabel>
                <Input
                  value={gateways.paddle.vendorId}
                  onChange={(e) => setGateways({
                    ...gateways,
                    paddle: { ...gateways.paddle, vendorId: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>API Key</FormLabel>
                <Input
                  type="password"
                  value={gateways.paddle.apiKey}
                  onChange={(e) => setGateways({
                    ...gateways,
                    paddle: { ...gateways.paddle, apiKey: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Public Key</FormLabel>
                <Input
                  type="password"
                  value={gateways.paddle.publicKey}
                  onChange={(e) => setGateways({
                    ...gateways,
                    paddle: { ...gateways.paddle, publicKey: e.target.value },
                  })}
                />
              </FormControl>
            </Stack>
          </Box>

          {/* Chargebee Configuration */}
          <Box>
            <Typography level="title-lg">Chargebee</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Site API Key</FormLabel>
                <Input
                  type="password"
                  value={gateways.chargebee.siteApiKey}
                  onChange={(e) => setGateways({
                    ...gateways,
                    chargebee: { ...gateways.chargebee, siteApiKey: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Site Name</FormLabel>
                <Input
                  value={gateways.chargebee.siteName}
                  onChange={(e) => setGateways({
                    ...gateways,
                    chargebee: { ...gateways.chargebee, siteName: e.target.value },
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gateway</FormLabel>
                <Select
                  value={gateways.chargebee.gateway}
                  onChange={(_, value) => setGateways({
                    ...gateways,
                    chargebee: { ...gateways.chargebee, gateway: value || 'stripe' },
                  })}
                >
                  <Option value="stripe">Stripe</Option>
                  <Option value="paypal">PayPal</Option>
                  <Option value="authorize_net">Authorize.net</Option>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
} 