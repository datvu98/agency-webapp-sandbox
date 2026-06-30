import React from 'react';
import { useStyles } from './FilterField.styles';

interface FilterFieldProps {
  label: string;
  children: React.ReactElement;
}

const FilterField = ({ label, children }: FilterFieldProps) => {
  const { styles } = useStyles();

  const control = React.cloneElement(children, {
    variant: 'borderless',
    style: { width: '100%' },
  });

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.separator} />
      <div className={styles.controlWrapper}>
        {control}
      </div>
    </div>
  );
};

export default FilterField;
