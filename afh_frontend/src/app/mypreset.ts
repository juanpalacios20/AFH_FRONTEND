//mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      401: '{gray.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{gray.500}',
    },
    graphics: {
      50: '{green.600}',
      100: '{green.400}',
      150: '{red.600}',
      200: '{red.400}',
      250: '{yellow.400}',
      300: '{orange.600}',
      350: '{sky.800}',
      400: '{indigo.500}',
      450: '{violet.900}',
      500: '{yellow.200}',
      550: '{orange.400}',
      600: '{sky.400}',
      650: '{indigo.300}',
      700: '{violet.500}',
    },
  },
});

export default MyPreset;
