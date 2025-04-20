import { Cell, flexRender } from '@tanstack/react-table';

export interface DataCellProps<T> {
  cell: Cell<T, unknown>;
}

export const DataCell = <T,>({ cell }: DataCellProps<T>) => {
  const isPinned = cell.column.getIsPinned();
  return (
    <div
      key={cell.id}
      className={`grid-data-cell ${isPinned ? 'pinned' : ''}`}
      style={{ width: `${cell.column.columnDef.meta?.width}px` }}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  );
};
