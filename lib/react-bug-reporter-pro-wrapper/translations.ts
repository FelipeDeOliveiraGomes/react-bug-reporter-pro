export const defaultTranslations = {
    recordButtonTitle: 'Record',
    stopButtonTitle: 'Stop',
    uploadButtonTitle: 'Upload files',
    downloadButtonTitle: 'Download files',
    cancelButtonTitle: 'Cancel',
} as const

export type TranslationsType = Partial<typeof defaultTranslations>
