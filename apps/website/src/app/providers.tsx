import { themes } from '@goddess/config';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="amethyst"
      themes={themes.map((theme) => [theme, `${theme}-dark`]).flat()}
    >
      {children}
    </ThemeProvider>
  );
}
