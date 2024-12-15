'use client';

import type { HTMLChakraProps, RecipeProps } from '@chakra-ui/react';
import { createRecipeContext } from '@chakra-ui/react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LinkButtonProps extends HTMLChakraProps<'a', RecipeProps<'button'>> {}

const { withContext } = createRecipeContext({ key: 'button' });

// Replace "a" with your framework's link component
export const LinkButton = withContext<HTMLAnchorElement, LinkButtonProps>('a');
