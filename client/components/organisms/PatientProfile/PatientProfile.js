import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #4CAF50;
  padding-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
`;

const Value = styled.div`
  font-size: 16px;
  color: #333;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  align-self: flex-start;

  &:hover {
    background: #45a049;
  }
`;

const PatientProfile = ({ patient, onSave, readOnly }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(patient);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    setEditMode(false);
  };

  const renderField = (label, value, field, type = 'text', parent = null) => {
    if (editMode && !readOnly) {
      return (
        <Field>
          <Label>{label}</Label>
          {type === 'textarea' ? (
            <TextArea
              value={parent ? formData[parent][field] : formData[field]}
              onChange={(e) => parent ? 
                handleNestedChange(parent, field, e.target.value) : 
                handleChange(field, e.target.value)
              }
            />
          ) : (
            <Input
              type={type}
              value={parent ? formData[parent][field] : formData[field]}
              onChange={(e) => parent ? 
                handleNestedChange(parent, field, e.target.value) : 
                handleChange(field, e.target.value)
              }
            />
          )}
        </Field>
      );
    }

    return (
      <Field>
        <Label>{label}</Label>
        <Value>{value}</Value>
      </Field>
    );
  };

  return (
    <ProfileContainer>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>Personal Information</SectionTitle>
          {!readOnly && (
            <Button onClick={editMode ? handleSubmit : () => setEditMode(true)}>
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </Button>
          )}
        </div>
        <Grid>
          {renderField('First Name', patient.firstName, 'firstName')}
          {renderField('Last Name', patient.lastName, 'lastName')}
          {renderField('Date of Birth', new Date(patient.dateOfBirth).toLocaleDateString(), 'dateOfBirth', 'date')}
          {renderField('Email', patient.email, 'email', 'email')}
          {renderField('Phone', patient.phone, 'phone', 'tel')}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Address</SectionTitle>
        <Grid>
          {renderField('Street', patient.address.street, 'street', 'text', 'address')}
          {renderField('City', patient.address.city, 'city', 'text', 'address')}
          {renderField('State', patient.address.state, 'state', 'text', 'address')}
          {renderField('Zip Code', patient.address.zipCode, 'zipCode', 'text', 'address')}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Medical History</SectionTitle>
        <Grid>
          {renderField('Allergies', patient.medicalHistory.allergies.join(', '), 'allergies', 'textarea', 'medicalHistory')}
          {renderField('Medications', patient.medicalHistory.medications.join(', '), 'medications', 'textarea', 'medicalHistory')}
          {renderField('Conditions', patient.medicalHistory.conditions.join(', '), 'conditions', 'textarea', 'medicalHistory')}
          {renderField('Notes', patient.medicalHistory.notes, 'notes', 'textarea', 'medicalHistory')}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Emergency Contact</SectionTitle>
        <Grid>
          {renderField('Name', patient.emergencyContact.name, 'name', 'text', 'emergencyContact')}
          {renderField('Relationship', patient.emergencyContact.relationship, 'relationship', 'text', 'emergencyContact')}
          {renderField('Phone', patient.emergencyContact.phone, 'phone', 'tel', 'emergencyContact')}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Insurance Information</SectionTitle>
        <Grid>
          {renderField('Provider', patient.insurance.provider, 'provider', 'text', 'insurance')}
          {renderField('Policy Number', patient.insurance.policyNumber, 'policyNumber', 'text', 'insurance')}
          {renderField('Group Number', patient.insurance.groupNumber, 'groupNumber', 'text', 'insurance')}
        </Grid>
      </Section>
    </ProfileContainer>
  );
};

PatientProfile.propTypes = {
  patient: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string
    }).isRequired,
    medicalHistory: PropTypes.shape({
      allergies: PropTypes.arrayOf(PropTypes.string),
      medications: PropTypes.arrayOf(PropTypes.string),
      conditions: PropTypes.arrayOf(PropTypes.string),
      notes: PropTypes.string
    }).isRequired,
    emergencyContact: PropTypes.shape({
      name: PropTypes.string,
      relationship: PropTypes.string,
      phone: PropTypes.string
    }).isRequired,
    insurance: PropTypes.shape({
      provider: PropTypes.string,
      policyNumber: PropTypes.string,
      groupNumber: PropTypes.string
    }).isRequired
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
};

PatientProfile.defaultProps = {
  readOnly: false
};

export default PatientProfile; 