// src/theme/index.ts
import { colors } from './colors';
import { typography } from './typography';

// Компоненты с кастомными стилями
const components = {
  Button: {
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
        },
        _active: {
          bg: 'primary.700',
        },
      },
      secondary: {
        bg: 'secondary.500',
        color: 'white',
        _hover: {
          bg: 'secondary.600',
        },
        _active: {
          bg: 'secondary.700',
        },
      },
      success: {
        bg: 'success.500',
        color: 'white',
        _hover: {
          bg: 'success.600',
        },
        _active: {
          bg: 'success.700',
        },
      },
      danger: {
        bg: 'error.500',
        color: 'white',
        _hover: {
          bg: 'error.600',
        },
        _active: {
          bg: 'error.700',
        },
      },
    },
  },
  Badge: {
    variants: {
      pending: {
        bg: 'gray.100',
        color: 'gray.800',
      },
      'in-progress': {
        bg: 'blue.100',
        color: 'blue.800',
      },
      completed: {
        bg: 'green.100',
        color: 'green.800',
      },
      failed: {
        bg: 'red.100',
        color: 'red.800',
      },
    },
  },
  Card: {
    baseStyle: {
      p: 4,
      borderRadius: 'md',
      bg: 'white',
    },
    variants: {
      elevated: {
        boxShadow: 'md',
      },
      bordered: {
        border: '1px',
        borderColor: 'gray.200',
      },
    },
  },
};

const theme = {
  colors,
  ...typography,
  components,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
};

export default theme;