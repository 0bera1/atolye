import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { PanelProps } from './types'

type PanelComponent = LazyExoticComponent<ComponentType<PanelProps>>

// Each tool's UI and its heavy libraries load only when that tool is opened.
export const PANELS: Record<string, PanelComponent> = {
  'pdf-birlestir': lazy(() => import('./pdf-birlestir/Panel')),
  'pdf-bol': lazy(() => import('./pdf-bol/Panel')),
  'pdf-sikistir': lazy(() => import('./pdf-sikistir/Panel')),
  'gorsel-boyutlandir': lazy(() => import('./gorsel-boyutlandir/Panel')),
  'gorsel-donustur': lazy(() => import('./gorsel-donustur/Panel')),
  'arka-plan-sil': lazy(() => import('./arka-plan-sil/Panel')),
  'metin-cikar-ocr': lazy(() => import('./metin-cikar-ocr/Panel')),
  'ses-kes': lazy(() => import('./ses-kes/Panel')),
}
