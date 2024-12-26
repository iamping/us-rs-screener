import { IconButton, Input, Show } from '@chakra-ui/react';
import { ChangeEvent, CSSProperties, useRef, useState } from 'react';
import { PiMagnifyingGlassBold, PiArrowCounterClockwiseDuotone, PiXDuotone } from 'react-icons/pi';
import { InputGroup } from '../ui/input-group';
import { useEventListener, useMediaQuery, useOnClickOutside } from 'usehooks-ts';
import { mobileMediaQuery } from '../../utils/constant';

export const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMobile = useMediaQuery(mobileMediaQuery);
  const styleForMobile: CSSProperties = isMobile
    ? { position: 'absolute', left: 78, right: 44, top: 8 }
    : { flexGrow: 0, minWidth: 250 };

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
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        setKeyword('');
      }
    }
  });

  useOnClickOutside(divRef, () => {
    if (keyword === '') {
      setOpen(false);
    }
  });

  const MagnifyIcon = (
    <>
      <Show when={open}>
        <div title="Clear search" onClick={clearSearch} style={{ cursor: 'pointer' }}>
          <PiArrowCounterClockwiseDuotone color="black" />
        </div>
        <IconButton size="xs" variant="outline" border={0} onClick={() => setOpen(false)}>
          {open && <PiXDuotone title="Close" />}
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
      <Show when={!open}>{MagnifyIcon}</Show>
      <Show when={open}>
        <div ref={divRef}>
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
        </div>
      </Show>
    </>
  );
};
