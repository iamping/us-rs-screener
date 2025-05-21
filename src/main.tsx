import { ChakraProvider } from '@chakra-ui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import './styles/main.css';
import { ColorModeProvider } from './components/ui/color-mode';
import { mySystem } from './theme/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={mySystem}>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>
);
