import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const SchedulerContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CalendarWrapper = styled.div`
  flex: 1;
  min-width: 300px;

  .react-calendar {
    width: 100%;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
`;

const TimeSlotsContainer = styled.div`
  flex: 1;
  min-width: 300px;
`;

const TimeSlotsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
`;

const TimeSlot = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.isSelected ? '#4CAF50' : '#ddd'};
  border-radius: 4px;
  background: ${props => props.isSelected ? '#4CAF50' : props.isAvailable ? '#fff' : '#f5f5f5'};
  color: ${props => props.isSelected ? '#fff' : props.isAvailable ? '#333' : '#999'};
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isAvailable && !props.isSelected ? '#f0f0f0' : ''};
    transform: ${props => props.isAvailable ? 'scale(1.02)' : 'none'};
  }
`;

const AppointmentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
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

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AppointmentScheduler = ({
  availableSlots,
  onScheduleAppointment,
  appointmentTypes,
  durations,
  existingAppointments
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    // Filter available slots for selected date
    const filteredSlots = availableSlots.filter(slot => {
      const slotDate = new Date(slot);
      return (
        slotDate.getDate() === selectedDate.getDate() &&
        slotDate.getMonth() === selectedDate.getMonth() &&
        slotDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    // Check conflicts with existing appointments
    const availableTimeSlots = filteredSlots.filter(slot => {
      const slotTime = new Date(slot).getTime();
      return !existingAppointments.some(apt => {
        const aptTime = new Date(apt.dateTime).getTime();
        const aptEnd = aptTime + apt.duration * 60000;
        return slotTime >= aptTime && slotTime < aptEnd;
      });
    });

    setTimeSlots(availableTimeSlots);
    setSelectedSlot(null);
  }, [selectedDate, availableSlots, existingAppointments]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot && selectedType) {
      onScheduleAppointment({
        dateTime: selectedSlot,
        type: selectedType,
        duration: selectedDuration
      });
    }
  };

  return (
    <SchedulerContainer>
      <CalendarWrapper>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
          tileDisabled={({ date }) => {
            // Disable weekends
            return date.getDay() === 0 || date.getDay() === 6;
          }}
        />
      </CalendarWrapper>

      <TimeSlotsContainer>
        <TimeSlotsList>
          {timeSlots.map((slot) => (
            <TimeSlot
              key={slot}
              isAvailable={true}
              isSelected={selectedSlot === slot}
              onClick={() => handleSlotSelect(slot)}
            >
              {formatTime(new Date(slot))}
            </TimeSlot>
          ))}
          {timeSlots.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>
              No available slots for this date
            </div>
          )}
        </TimeSlotsList>

        <AppointmentForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Appointment Type</Label>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
            >
              <option value="">Select type</option>
              {appointmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Duration (minutes)</Label>
            <Select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              required
            >
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </Select>
          </FormGroup>

          <Button type="submit" disabled={!selectedSlot || !selectedType}>
            Schedule Appointment
          </Button>
        </AppointmentForm>
      </TimeSlotsContainer>
    </SchedulerContainer>
  );
};

AppointmentScheduler.propTypes = {
  availableSlots: PropTypes.arrayOf(PropTypes.string).isRequired,
  onScheduleAppointment: PropTypes.func.isRequired,
  appointmentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  durations: PropTypes.arrayOf(PropTypes.number).isRequired,
  existingAppointments: PropTypes.arrayOf(
    PropTypes.shape({
      dateTime: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired
    })
  ).isRequired
};

AppointmentScheduler.defaultProps = {
  durations: [30, 45, 60, 90],
  existingAppointments: []
};

export default AppointmentScheduler; 