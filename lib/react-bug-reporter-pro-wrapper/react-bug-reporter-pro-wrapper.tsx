import React, { useEffect, useState } from 'react'
import { FaBug } from 'react-icons/fa'
import { PiRecordFill } from 'react-icons/pi'
import { FaPause } from 'react-icons/fa6'
import useHttpRecorder from '../hooks/use-requests-recorder'
import useScreenRecorder from '../hooks/use-screen-recorder'
import { defaultTranslations, TranslationsType } from './translations'
import { ReactBugReporterProWrapperType } from './types'
import { GetFnParamType } from '../utils-types'
import './react-bug-reporter-pro-wrapper.css'

// separetedd only to encapsulate this frequent updated state, kind of micro-optimization
const Timer: React.FC<{ initialTime: number; stop: boolean }> = ({
    initialTime,
    stop,
}) => {
    const [currentTime, setCurrentTime] = useState(initialTime)

    const getDiffTimeFormatted = () => {
        const diff = (currentTime - initialTime) / 1000
        const minutes = String(
            diff >= 60 ? parseInt(String(diff / 60)) : 0
        ).padStart(2, '0')

        const seconds = String(
            diff >= 60 ? parseInt(String(diff % 60)) : diff.toFixed(0)
        ).padStart(2, '0')

        return {
            minutes,
            seconds,
        }
    }

    const { minutes, seconds } = getDiffTimeFormatted()

    useEffect(() => {
        if (!initialTime) return

        const intervalId = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [stop, initialTime])

    return (
        <span>
            {minutes}:{seconds}
        </span>
    )
}

/**
 * A wrapper component for reporting bugs that includes recording HTTP requests
 * and screen actions, along with the ability to upload and download files.
 *
 * @template T - The type of the result from the request file upload callback.
 * @template U - The type of the result from the video upload callback.
 *
 * @param {Object} props - The component props.
 * @param {string} props.description - A description of the bug being reported.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setDescription - Function to update the description state.
 * @param {boolean} [props.closeModalAfterDownload=false] - If true, the modal will close after downloading files.
 * @param {boolean} [props.audioEnabled=false] - If true, audio recording will be enabled.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {TranslationsType} [props.translations] - Custom translations for button labels.
 * @param {boolean} [props.allowDownloadFiles=false] - If true, allows users to download recorded files.
 * @param {{ reqFileName?: string; vidFileName?: string; }} [props.customFileNames] - Custom file names for uploads.
 * @param {{ uploadRequestFileCallback?: (httpReqsFile: FormData) => Promise<T>; uploadVideoCallback?: (videoFile: FormData) => Promise<U>; }} [props.uploadFiles] - Callback functions for file uploads.
 * @param {(params: OnFileUploadedParams<T, U>) => Promise<unknown>} [props.onFileUploaded] - Callback invoked after files have been uploaded.
 *
 * @returns {JSX.Element} The rendered bug reporter component.
 */
const ReactBugReporterProWrapper: ReactBugReporterProWrapperType = ({
    description,
    className,
    translations,
    allowDownloadFiles,
    uploadFiles,
    customFileNames,
    audioEnabled,
    closeModalAfterDownload,
    setDescription,
    onFileUploaded,
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [toolsAreOpen, setToolsAreOpen] = useState(false)
    const [recordInitTime, setRecordInitTime] = useState(0)

    const requestRecorder = useHttpRecorder()
    const screenRecorder = useScreenRecorder()

    const getTranslation = (key: keyof TranslationsType) => {
        return translations?.[key] ?? defaultTranslations[key]
    }

    const concatClassnames = (cn: string) => {
        return `react-bug-reporter-pro${cn} ${className ? `${className}${cn}` : ''}`
    }

    const handleStartRecording = () => {
        requestRecorder.startRecording()
        screenRecorder.startRecording(audioEnabled)
        setRecordInitTime(Date.now())
    }

    const handleStopRecording = () => {
        requestRecorder.stopRecording(customFileNames?.reqFileName)
        screenRecorder.stopRecording(customFileNames?.vidFileName)
        setModalIsOpen(true)
        setRecordInitTime(0)
        setToolsAreOpen(false)
    }

    const handleCloseModal = () => {
        screenRecorder.revokeUrl()
        setDescription('')
        setModalIsOpen(false)
    }

    const handleDownloadClick = () => {
        screenRecorder.downloadFile()
        requestRecorder.downloadFile()
        if (closeModalAfterDownload) handleCloseModal()
    }

    const handleUploadClick = async () => {
        const uploadVidCallback = uploadFiles?.uploadRequestFileCallback
        const uploadReqFileCallback = uploadFiles?.uploadVideoCallback

        if (!uploadVidCallback && !uploadReqFileCallback) {
            console.error('Missing upload callback')
            return
        }

        let videoUploadResult: GetFnParamType<
            typeof onFileUploaded
        >['videoUploadResult']

        let requestsFileUploadResult: GetFnParamType<
            typeof onFileUploaded
        >['requestsFileUploadResult']

        try {
            if (uploadVidCallback) {
                videoUploadResult = (await screenRecorder.uploadFile(
                    uploadVidCallback
                )) as typeof videoUploadResult
            }

            if (uploadReqFileCallback) {
                requestsFileUploadResult = (await requestRecorder.uploadFile(
                    uploadReqFileCallback
                )) as typeof requestsFileUploadResult
            }

            if (onFileUploaded) {
                await onFileUploaded({
                    requestsFileUploadResult,
                    videoUploadResult,
                })
            }
        } catch (error) {
            console.error('Error to upload files: ', error)
        } finally {
            handleCloseModal()
        }
    }

    return (
        <>
            <div className={concatClassnames('__tools-container')}>
                <button
                    onClick={() => setToolsAreOpen((prev) => !prev)}
                    className={concatClassnames('__open-tools-btn')}
                >
                    <FaBug />
                </button>

                {toolsAreOpen ? (
                    <>
                        {requestRecorder.recording ? (
                            <button
                                onClick={handleStopRecording}
                                className={concatClassnames('__stop-btn')}
                            >
                                <FaPause />
                                {getTranslation('stopButtonTitle')}
                                <Timer
                                    initialTime={recordInitTime}
                                    stop={!screenRecorder.recording}
                                />
                            </button>
                        ) : (
                            <button
                                onClick={handleStartRecording}
                                className={concatClassnames('__record-btn')}
                            >
                                <PiRecordFill />
                                {getTranslation('recordButtonTitle')}
                            </button>
                        )}
                    </>
                ) : null}
            </div>

            {modalIsOpen ? (
                <div
                    onClick={handleCloseModal}
                    className={concatClassnames('__modal-overlay')}
                >
                    <section
                        onClick={(e) => e.stopPropagation()}
                        className={concatClassnames('__modal')}
                    >
                        <button
                            onClick={handleCloseModal}
                            className={concatClassnames('__close-modal-btn')}
                        >
                            x
                        </button>

                        <video
                            className={concatClassnames('__video')}
                            src={screenRecorder.localVideoUrl ?? ''}
                            controls
                        ></video>

                        <textarea
                            value={description}
                            onChange={({ target }) =>
                                setDescription(target.value)
                            }
                            className={concatClassnames('__text-area')}
                        />

                        <div className={concatClassnames('__actions')}>
                            <button
                                onClick={handleCloseModal}
                                className={concatClassnames('__cancel-btn')}
                            >
                                {getTranslation('cancelButtonTitle')}
                            </button>

                            {allowDownloadFiles ? (
                                <button
                                    onClick={handleDownloadClick}
                                    className={concatClassnames(
                                        '__download-btn'
                                    )}
                                >
                                    {getTranslation('downloadButtonTitle')}
                                </button>
                            ) : null}

                            {uploadFiles ? (
                                <button
                                    onClick={handleUploadClick}
                                    className={concatClassnames('__upload-btn')}
                                >
                                    {getTranslation('uploadButtonTitle')}
                                </button>
                            ) : null}
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    )
}

export default ReactBugReporterProWrapper
