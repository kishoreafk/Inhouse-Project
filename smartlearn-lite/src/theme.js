import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    secondary: { main: '#14b8a6' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 2px 8px rgba(99, 102, 241, 0.08)',
    '0 4px 16px rgba(99, 102, 241, 0.12)',
    '0 8px 24px rgba(99, 102, 241, 0.16)',
    ...Array(21).fill('0 12px 32px rgba(99, 102, 241, 0.2)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease',
            '&:hover': { boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)' },
          },
        },
      },
    },
  },
});
