const PATHS: Record<string, string> = {
  merge: 'M6 4v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v2M18 4v6M9 17l-3 3-3-3M21 7l-3-3-3 3',
  split: 'M12 3v8M12 11l-6 6M12 11l6 6M6 17v4M18 17v4',
  compress: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  resize: 'M4 9V4h5M20 15v5h-5M4 4l7 7M20 20l-7-7',
  convert: 'M4 8h13l-3-3M20 16H7l3 3',
  cutout: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 21a7 7 0 0 1 14 0',
  text: 'M5 5h14M12 5v14M9 19h6',
  audio: 'M4 12v0M8 8v8M12 4v16M16 9v6M20 12v0',
  sign: 'M3 17c3-6 5-9 7-9s0 8 3 8 3-4 4-4 1 2 4 2M3 21h18',
  imagepdf: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M9 8.5v0',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v0M20 20v0M14 20h3',
  json: 'M8 4C5 4 6 9 4 12c2 3 1 8 4 8M16 4c3 0 2 5 4 8-2 3-1 8-4 8',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  close: 'M6 6l12 12M18 6L6 18',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  offline:
    'M3 3l18 18M8.5 8.5A8 8 0 0 0 4 11M12 20v0M5 14.5a10 10 0 0 1 5-2.7M16.5 11.8a10 10 0 0 1 2.5 2.7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  help: 'M12 17v0M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
}

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] ?? PATHS.file} />
    </svg>
  )
}
