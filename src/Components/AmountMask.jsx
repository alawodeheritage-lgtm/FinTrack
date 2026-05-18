import React from 'react';

const AmountMask = ({ amount = 0, currency = '$', isPrivate = false, prefix = '', className = '' }) => {
  const value = typeof amount === 'number' ? amount : Number(amount || 0);
  const formattedAmount = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const display = isPrivate ? '••••••' : `${prefix}${currency}${formattedAmount}`;

  return (
    <span className={`${className} ${isPrivate ? 'blur-md select-none' : 'blur-0 transition-all duration-300'}`}>
      {display}
    </span>
  );
};

export default AmountMask;
