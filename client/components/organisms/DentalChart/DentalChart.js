import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TeethRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
`;

const ToothContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ToothNumber = styled.div`
  font-size: 12px;
  color: #666;
`;

const Tooth = styled.div`
  width: 30px;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${props => getToothColor(props.condition)};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #ccc;
`;

const getToothColor = (condition) => {
  switch (condition) {
    case 'Healthy':
      return '#ffffff';
    case 'Decayed':
      return '#ffcccc';
    case 'Filled':
      return '#b3e6cc';
    case 'Crown':
      return '#ffd700';
    case 'Missing':
      return '#f0f0f0';
    case 'Bridge':
      return '#c6e2ff';
    case 'Implant':
      return '#e6ccff';
    case 'Root Canal':
      return '#ffdab9';
    default:
      return '#ffffff';
  }
};

const conditions = [
  'Healthy',
  'Decayed',
  'Filled',
  'Crown',
  'Missing',
  'Bridge',
  'Implant',
  'Root Canal'
];

const DentalChart = ({ teeth, onToothClick, readOnly }) => {
  const [upperTeeth, setUpperTeeth] = useState([]);
  const [lowerTeeth, setLowerTeeth] = useState([]);

  useEffect(() => {
    const upper = teeth.filter(tooth => tooth.number <= 16);
    const lower = teeth.filter(tooth => tooth.number > 16);
    
    setUpperTeeth(upper.sort((a, b) => a.number - b.number));
    setLowerTeeth(lower.sort((a, b) => a.number - b.number));
  }, [teeth]);

  const handleToothClick = (tooth) => {
    if (!readOnly && onToothClick) {
      onToothClick(tooth);
    }
  };

  return (
    <ChartContainer>
      <TeethRow>
        {upperTeeth.map(tooth => (
          <ToothContainer key={tooth.number}>
            <ToothNumber>{tooth.number}</ToothNumber>
            <Tooth
              condition={tooth.condition}
              onClick={() => handleToothClick(tooth)}
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            />
          </ToothContainer>
        ))}
      </TeethRow>

      <TeethRow>
        {lowerTeeth.map(tooth => (
          <ToothContainer key={tooth.number}>
            <Tooth
              condition={tooth.condition}
              onClick={() => handleToothClick(tooth)}
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            />
            <ToothNumber>{tooth.number}</ToothNumber>
          </ToothContainer>
        ))}
      </TeethRow>

      <Legend>
        {conditions.map(condition => (
          <LegendItem key={condition}>
            <LegendColor color={getToothColor(condition)} />
            <span>{condition}</span>
          </LegendItem>
        ))}
      </Legend>
    </ChartContainer>
  );
};

DentalChart.propTypes = {
  teeth: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.number.isRequired,
      condition: PropTypes.string.isRequired
    })
  ).isRequired,
  onToothClick: PropTypes.func,
  readOnly: PropTypes.bool
};

DentalChart.defaultProps = {
  readOnly: false
};

export default DentalChart; 