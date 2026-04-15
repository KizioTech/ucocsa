import React from 'react';
import { FixedSizeGrid } from 'react-window';
import HymnCard from './HymnCard';

const VirtualizedHymnGrid = ({ hymns, itemHeight = 300, onHymnSelect }) => {
  const columnCount = Math.min(3, Math.max(1, Math.floor(window.innerWidth / 320)));
  const rowCount = Math.ceil(hymns.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const hymn = hymns[index];

    if (!hymn) return null;

    return (
      <div style={style} className="p-2">
        <HymnCard hymn={hymn} onSelect={onHymnSelect} />
      </div>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={320}
      height={600}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width="100%"
    >
      {Cell}
    </FixedSizeGrid>
  );
};

export default VirtualizedHymnGrid;