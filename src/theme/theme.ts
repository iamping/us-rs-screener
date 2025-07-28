import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: 'Outfit, serif' },
        heading: { value: 'Outfit, serif' },
        borel: { value: 'Borel, serif' }
      }
    },
    semanticTokens: {
      colors: {
        default: {
          value: { base: '{colors.black}', _dark: '{colors.white}' }
        },
        subtle: {
          value: { base: '{colors.gray.500}', _dark: '{colors.gray.400}' }
        }
      }
    }
  }
});

export const mySystem = createSystem(defaultConfig, customConfig);
