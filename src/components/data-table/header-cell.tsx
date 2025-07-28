import { flexRender, Header } from '@tanstack/react-table';
import { Filter } from '@/components/filter/filter';
import { SortIcon } from '@/components/ui/sort-icon';

interface HeaderCellProps<T> {
  header: Header<T, unknown>;
  resetPageIndex: () => void;
}

export const HeaderCell = <T,>({ header, resetPageIndex }: HeaderCellProps<T>) => {
  const canSort = header.column.getCanSort();
  const isFilterNotReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length === 0;
  const isFilterReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length > 0;
  const width = header.column.columnDef.meta?.width ?? 'auto';
  const filterVariant = header.column.columnDef.meta?.filterVariant;
  const isPinned = header.column.getIsPinned();

  return (
    <div
      key={header.id}
      className={`grid-header-cell ${canSort ? 'sortable' : ''} ${isPinned ? 'pinned' : ''}`}
      style={{
        minWidth: `${width}px`
      }}
      onClick={header.column.getToggleSortingHandler()}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flexGrow: 1 }}>{flexRender(header.column.columnDef.header, header.getContext())}</div>
        {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
        {isFilterNotReady && <Filter.Empty />}
        {isFilterReady && (
          <Filter
            id={header.id}
            popupWidth={width}
            filterVariant={filterVariant}
            column={header.column}
            resetPageIndex={resetPageIndex}
          />
        )}
      </div>
    </div>
  );
};
