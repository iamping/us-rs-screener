import { IconButton } from '@chakra-ui/react';
import { flexRender, Header } from '@tanstack/react-table';
import { PiExportDuotone } from 'react-icons/pi';
import { Filter } from '@/components/filter/filter';
import { SortIcon } from '@/components/ui/sort-icon';

export interface HeaderCellProps<T> {
  header: Header<T, unknown>;
  resetPageIndex: () => void;
  exportData?: () => void;
}

export const HeaderCell = <T,>({ header, exportData, resetPageIndex }: HeaderCellProps<T>) => {
  const canSort = header.column.getCanSort();
  const isFilterNotReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length === 0;
  const isFilterReady = header.column.getCanFilter() && header.column.getFacetedRowModel().rows.length > 0;
  const width = header.column.columnDef.meta?.width ?? 'auto';
  const filterVariant = header.column.columnDef.meta?.filterVariant;
  const isPinned = header.column.getIsPinned();
  const showExportIcon = header.column.columnDef.meta?.showExportIcon;

  const exportTickerList = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (exportData) {
      exportData();
    }
  };

  return (
    <div
      key={header.id}
      className={`grid-header-cell ${canSort ? 'sort' : ''} ${isPinned ? 'pinned' : ''}`}
      style={{
        minWidth: `${width}px`
      }}
      onClick={header.column.getToggleSortingHandler()}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flexGrow: 1 }}>{flexRender(header.column.columnDef.header, header.getContext())}</div>
        {canSort && <SortIcon sortDirection={header.column.getIsSorted()} />}
        {showExportIcon && (
          <IconButton size="2xs" variant="plain" className="export-icon" color="gray.300" onClick={exportTickerList}>
            <PiExportDuotone title="Export ticker list" />
          </IconButton>
        )}
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
