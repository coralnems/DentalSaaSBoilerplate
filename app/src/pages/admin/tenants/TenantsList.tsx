import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  Sheet,
  Typography,
  Chip,
  IconButton,
  Input,
  Select,
  Option,
  Link,
} from '@mui/joy';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: string;
  createdAt: string;
}

export default function TenantsList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'past_due':
        return 'warning';
      case 'canceled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    if (filter !== 'all' && tenant.status !== filter) return false;
    return tenant.name.toLowerCase().includes(search.toLowerCase()) ||
           tenant.subdomain.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="h4">Tenants</Typography>
        <Button
          component={RouterLink}
          to="/admin/tenants/new"
          startDecorator={<AddIcon />}
        >
          Add Tenant
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Input
          startDecorator={<SearchIcon />}
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Select value={filter} onChange={(_, value) => setFilter(value || 'all')}>
          <Option value="all">All Status</Option>
          <Option value="active">Active</Option>
          <Option value="past_due">Past Due</Option>
          <Option value="canceled">Canceled</Option>
        </Select>
      </Box>

      <Sheet variant="outlined">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subdomain</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No tenants found</td>
              </tr>
            ) : (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <Link
                      component={RouterLink}
                      to={`/admin/tenants/${tenant.id}`}
                      fontWeight="lg"
                    >
                      {tenant.name}
                    </Link>
                  </td>
                  <td>{tenant.subdomain}</td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={tenant.plan === 'enterprise' ? 'primary' : 'neutral'}
                    >
                      {tenant.plan}
                    </Chip>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={getStatusColor(tenant.status) as any}
                    >
                      {tenant.status}
                    </Chip>
                  </td>
                  <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        component={RouterLink}
                        to={`/admin/tenants/${tenant.id}/settings`}
                        size="sm"
                        variant="plain"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={() => {
                          // Handle delete
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  );
} 