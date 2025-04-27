import { IconButton } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { PiExportDuotone } from 'react-icons/pi';
import { tableGlobal } from '@/helpers/table.helper';
import { appDropdownAtom } from '@/states/atom';
import { toKebabCase } from '@/utils/common.utils';

export const ExportDataButton = () => {
  const dropdownState = useAtomValue(appDropdownAtom);
  const disableExport = !tableGlobal.table || tableGlobal.table.getRowModel().rows.length === 0;
  const exportTickerList = () => {
    if (!tableGlobal.table || disableExport) {
      return;
    }

    // Prepare data
    const currentTickers = tableGlobal.table
      .getRowModel()
      .rows.map((row) => `${row.original.ticker}`)
      .join(',');
    const todayDateTxt = new Date().toISOString().substring(0, 10);
    const fileName = toKebabCase(dropdownState.preset.title);

    // Create a blob
    const blob = new Blob([currentTickers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link to download it
    const pom = document.createElement('a');
    pom.href = url;
    pom.setAttribute('download', `${fileName}.${todayDateTxt}.csv`);
    pom.click();
  };

  return (
    <>
      <IconButton
        title="Export ticker list"
        size="xs"
        variant="outline"
        border={0}
        onClick={exportTickerList}
        disabled={disableExport}>
        <PiExportDuotone />
      </IconButton>
    </>
  );
};
