import React, { useState } from 'react'
import { FaBug } from 'react-icons/fa'
import { PiRecordFill } from 'react-icons/pi'
import { FaPause } from 'react-icons/fa6'
import useHttpRecorder from '../hooks/use-requests-recorder'
import useScreenRecorder from '../hooks/use-screen-recorder'
import { defaultTranslations, TranslationsType } from './translations'
import './react-bug-reporter-pro-wrapper.css'

interface ReactBugReporterProWrapper {
    description: string
    setDescription: React.Dispatch<React.SetStateAction<string>>
    audioEnabled?: boolean
    className?: string
    translations?: TranslationsType
    allowDownloadFiles?: boolean
    customFileNames?: {
        reqFileName?: string
        vidFileName?: string
    }
    uploadFiles?: {
        uploadRequestFileCallback?: <T>(httpReqsFile: FormData) => Promise<T>
        uploadVideoCallback?: <T>(videoFile: FormData) => Promise<T>
    }
}

const ReactBugReporterProWrapper: React.FC<ReactBugReporterProWrapper> = ({
    description,
    className,
    translations,
    allowDownloadFiles,
    uploadFiles,
    customFileNames,
    audioEnabled,
    setDescription,
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [toolsAreOpen, setToolsAreOpen] = useState(false)

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
    }

    const handleStopRecording = () => {
        requestRecorder.stopRecording(customFileNames?.reqFileName)
        screenRecorder.stopRecording(customFileNames?.vidFileName)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        screenRecorder.revokeUrl()
        setModalIsOpen(false)
    }

    const handleDownloadClick = () => {
        screenRecorder.downloadFile()
        requestRecorder.downloadFile()
    }

    const handleUploadClick = async () => {
        const uploadVidCallback = uploadFiles?.uploadRequestFileCallback
        const uploadReqFileCallback = uploadFiles?.uploadVideoCallback

        if (!uploadVidCallback && !uploadReqFileCallback) {
            console.error('Missing upload callback')
            return
        }

        try {
            if (uploadVidCallback) {
                await screenRecorder.uploadFile(uploadVidCallback)
            }

            if (uploadReqFileCallback) {
                await requestRecorder.uploadFile(uploadReqFileCallback)
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
                                        '__donwload-btn'
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
