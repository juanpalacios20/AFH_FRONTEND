//mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{lime.50}',
      100: '{lime.100}',
      200: '{lime.200}',
      300: '{lime.300}',
      400: '{lime.400}',
      401: '{gray.400}',
      500: '{lime.400}',
      600: '{lime.600}',
      700: '{lime.700}',
      800: '{lime.800}',
      900: '{lime.900}',
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
