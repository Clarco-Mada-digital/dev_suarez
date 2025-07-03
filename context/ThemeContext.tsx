import { createContext, useContext } from "react"
// Creation

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "",
  setTheme: () => {},
})

export const useThemeContext = () => useContext(ThemeContext)
// Initialisation
// Consumation