import React, { useState } from 'react'
import { FaBug } from 'react-icons/fa'
import { PiRecordFill } from 'react-icons/pi'
import { FaPause } from 'react-icons/fa6'
import useHttpRecorder from '../hooks/use-requests-recorder'
import useScreenRecorder from '../hooks/use-screen-recorder'
import { defaultTranslations, TranslationsType } from './translations'
import { ReactBugReporterProWrapperType } from './types'
import { GetFnParamType } from '../utils-types'
import './react-bug-reporter-pro-wrapper.css'

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
