// Applies the saved theme before first paint to avoid a flash.
try {
  var saved = localStorage.getItem('atolye-theme')
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved)
  }
} catch (e) {
  // storage unavailable: fall back to the system preference
}
