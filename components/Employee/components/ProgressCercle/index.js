import React from 'react';
import Circle from 'react-circle';

const ProgressCircle = ({ completed, total }) => {
  const percentage = (total === 0) ? "0.00" : ((completed / total) * 100).toFixed(2);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Circle
        progress={percentage}
        progressColor="blue"
        showPercentValue={true}
        showPercentValueDecimalPlaces={2}
        size={200}
      />
      <div style={{ marginLeft: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'blue', marginRight: '5px' }}></div>
          <span>Tâches terminées : {completed}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'gray', marginRight: '5px' }}></div>
          <span>Tâches non terminées : {total - completed}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;