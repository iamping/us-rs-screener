import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: 'Outfit, serif' },
        heading: { value: 'Outfit, serif' },
        borel: { value: 'Borel, serif' }
      }
    }
  }
});

export const mySystem = createSystem(defaultConfig, customConfig);
