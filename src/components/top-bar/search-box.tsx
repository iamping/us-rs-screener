import { IconButton, Input, Show } from '@chakra-ui/react';
import fuzzysort from 'fuzzysort';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ChangeEvent, CSSProperties, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { PiMagnifyingGlassBold, PiTrash } from 'react-icons/pi';
import { useDebounceCallback, useEventListener, useMediaQuery, useOnClickOutside } from 'usehooks-ts';
import { InputGroup } from '@/components/ui/input-group';
import { fuzzyListAtom, preFilteredListAtom, searchBoxOpenAtom, tickerAtom } from '@/states/atom';
import { Stock } from '@/types/stock.type';
import { mobileMediaQuery } from '@/utils/common.utils';

export const SearchBox = () => {
  const [open, setOpen] = useAtom(searchBoxOpenAtom);
  const [keyword, setKeyword] = useState('');

  const preFilteredList = useAtomValue(preFilteredListAtom);
  const [fuzzyList, setFuzzyList] = useAtom(fuzzyListAtom);
  const setTicker = useSetAtom(tickerAtom);

  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery(mobileMediaQuery);
  const styleForMobile: CSSProperties = isMobile ? { flexGrow: 1 } : { flexGrow: 0, minWidth: 250 };

  const openSearch = () => {
    setOpen((val) => !val);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const clearSearch = () => {
    setOpen(true);
    setKeyword('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const highlightFn = (m: string, i: number) => (
    <span className="highlight" key={i}>
      {m}
    </span>
  );

  const fuzzySearch = useCallback(
    (keyword: string) => {
      const results = fuzzysort.go(keyword, preFilteredList, {
        threshold: 0.3,
        keys: ['ticker', 'companyName']
      });
      if (results.length === 0) {
        setFuzzyList(keyword.length > 0 ? [{ fuzzySearchEmpty: true } as Stock] : []);
      } else {
        setFuzzyList(
          results.map((stock) => {
            const highlightedTicker = stock[0].target.length > 0 ? stock[0].highlight(highlightFn) : null;
            const highlightedCompanyName = stock[1].target.length > 0 ? stock[1].highlight(highlightFn) : null;
            return { ...stock.obj, highlightedTicker, highlightedCompanyName };
          })
        );
      }
    },
    [preFilteredList, setFuzzyList]
  );
  const debouncedFuzzySearch = useDebounceCallback(fuzzySearch, 250);

  useEffect(() => {
    debouncedFuzzySearch(keyword);
  }, [keyword, debouncedFuzzySearch]);

  useEventListener('keydown', (event) => {
    const id = (event.target as HTMLElement)?.id ?? '';
    if (id === 'search-stocks' || id === '') {
      if (/^[A-Za-z0-9 \-,.]$/.test(event.key)) {
        setOpen((val) => {
          if (!val) {
            setKeyword(event.key);
          }
          return true;
        });
      }
      if (event.key === 'Escape') {
        if (keyword.length === 0) {
          setOpen(false);
        }
        setKeyword('');
      }
      if (event.key === 'Enter') {
        setTimeout(() => {
          if (keyword.length > 0 && fuzzyList.length > 0 && !fuzzyList.some((e) => e.fuzzySearchEmpty)) {
            setTicker(fuzzyList[0].ticker);
          }
          inputRef.current?.select();
        }, 50);
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        setTimeout(() => {
          inputRef.current?.select();
        }, 50);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  });

  useOnClickOutside(divRef as RefObject<HTMLDivElement>, () => {
    if (keyword === '') {
      setOpen(false);
    }
  });

  const MagnifyIcon = (
    <>
      <Show when={open}>
        <IconButton size="xs" variant="outline" border={0} onClick={clearSearch}>
          {open && keyword.length > 0 && <PiTrash title="Clear search" />}
          {open && keyword.length === 0 && <PiMagnifyingGlassBold title="Search stocks" />}
        </IconButton>
      </Show>
      <Show when={!open}>
        <IconButton size="xs" variant="outline" border={0} onClick={openSearch}>
          {!open && <PiMagnifyingGlassBold title="Search stocks" />}
        </IconButton>
      </Show>
    </>
  );

  return (
    <>
      <div ref={divRef} style={{ flexGrow: open && isMobile ? 1 : undefined, display: 'flex', alignItems: 'flex-end' }}>
        <Show when={!open}>{MagnifyIcon}</Show>
        <Show when={open}>
          <InputGroup flex="1" style={styleForMobile} endElement={MagnifyIcon} endElementProps={{ padding: 0 }}>
            <Input
              ref={inputRef}
              id="search-stocks"
              variant="subtle"
              placeholder="Search stocks"
              size="xs"
              focusRing="none"
              border={0}
              value={keyword}
              maxLength={30}
              onChange={onInputChange}
            />
          </InputGroup>
        </Show>
      </div>
    </>
  );
};
