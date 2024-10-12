import { TranslationsType } from './translations'

interface OnFileUploadedParams<T, U> {
    requestsFileUploadResult?: T
    videoUploadResult?: U
}

interface ReactBugReporterProWrapperProps<T, U> {
    description: string
    setDescription: React.Dispatch<React.SetStateAction<string>>
    closeModalAfterDownload?: boolean
    audioEnabled?: boolean
    className?: string
    translations?: TranslationsType
    allowDownloadFiles?: boolean
    customFileNames?: {
        reqFileName?: string
        vidFileName?: string
    }
    uploadFiles?: {
        uploadRequestFileCallback?: (httpReqsFile: FormData) => Promise<T>
        uploadVideoCallback?: (videoFile: FormData) => Promise<U>
    }
    onFileUploaded?: (params: OnFileUploadedParams<T, U>) => Promise<unknown>
}

export type ReactBugReporterProWrapperType = <T, U>(
    props: ReactBugReporterProWrapperProps<T, U>
) => JSX.Element
