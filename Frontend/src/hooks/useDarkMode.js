import { useEffect, useState } from 'react'

/**
 * useDarkMode Hook
 * Maneja el estado del tema oscuro/claro y persiste la preferencia en localStorage
 */
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Leer preferencia guardada de localStorage
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    
    // Fallback a preferencia del sistema operativo
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Actualizar clase 'dark' en el elemento raíz y guardar en localStorage
    const html = document.documentElement
    
    if (isDark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(!isDark)

  return { isDark, toggle }
}

export default useDarkMode
