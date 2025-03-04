import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid #eee;
  color: #666;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const Select = styled.select`
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Error = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', formData);
      setIsModalOpen(false);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'staff'
      });
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await axios.patch(`/api/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  if (!currentUser?.role === 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <Container>
      <Header>
        <Title>User Management</Title>
        <Button onClick={() => setIsModalOpen(true)}>Add New User</Button>
      </Header>

      {error && <Error>{error}</Error>}

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Select
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                  disabled={user._id === currentUser._id}
                >
                  <option value="admin">Admin</option>
                  <option value="dentist">Dentist</option>
                  <option value="staff">Staff</option>
                </Select>
              </Td>
              <Td>
                <Button
                  onClick={() => handleDeleteUser(user._id)}
                  style={{ background: '#dc3545' }}
                  disabled={user._id === currentUser._id}
                >
                  Delete
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <Form onSubmit={handleCreateUser}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="dentist">Dentist</option>
                  <option value="staff">Staff</option>
                </Select>
              </FormGroup>
              <Button type="submit">Create User</Button>
              <Button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: '#6c757d' }}
              >
                Cancel
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default UserManagement; 