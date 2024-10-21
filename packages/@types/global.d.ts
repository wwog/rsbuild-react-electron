import type i18nMessages from '../i18n/out/en.json'

export type I18nMessages = typeof i18nMessages

export type BroadcastData = { type: BroadcastType; payload: any }

export type SupportedLanguage = { name: string; key: string }
