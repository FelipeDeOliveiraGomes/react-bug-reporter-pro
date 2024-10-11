import { useState } from 'react'
import { FaBug } from 'react-icons/fa'
import { PiRecordFill } from 'react-icons/pi'
import { FaPause } from 'react-icons/fa6'
import useHttpRecorder from '../hooks/use-requests-recorder'
import useScreenRecorder from '../hooks/use-screen-recorder'
import './react-bug-reporter-pro-wrapper.css'

interface TranslationsText {
    recordButtonTitle: string
    uploadButtonTitle: string
    stopButtonTitle: 'Stop'
    downloadButtonTitle: string
    cancelButtonTitle: string
}

interface ReactBugReporterProWrapper {
    className?: string
    translations?: Partial<TranslationsText>
}

const ReactBugReporterProWrapper: React.FC<ReactBugReporterProWrapper> = ({
    className,
    translations,
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [toolsAreOpen, setToolsAreOpen] = useState(false)

    const requestRecorder = useHttpRecorder()
    const screenRecorder = useScreenRecorder()

    const defaultTranslations: TranslationsText = {
        recordButtonTitle: 'Record',
        stopButtonTitle: 'Stop',
        uploadButtonTitle: 'Upload files',
        downloadButtonTitle: 'Download files',
        cancelButtonTitle: 'Cancel',
    }

    const getTranslation = (key: keyof TranslationsText) => {
        return translations?.[key] ?? defaultTranslations[key]
    }

    const concatClassnames = (cn: string) => {
        return `react-bug-reporter-pro${cn} ${className ? `${className}${cn}` : ''}`
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
                                onClick={() => {
                                    requestRecorder.stopRecording()
                                    screenRecorder.stopRecording()
                                    setModalIsOpen(true)
                                }}
                                className={concatClassnames('__stop-btn')}
                            >
                                <FaPause />
                                {getTranslation('stopButtonTitle')}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    requestRecorder.startRecording()
                                    screenRecorder.startRecording()
                                }}
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
                    onClick={() => setModalIsOpen(false)}
                    className={concatClassnames('__modal-overlay')}
                >
                    <section
                        onClick={(e) => e.stopPropagation()}
                        className={concatClassnames('__modal')}
                    >
                        <button
                            onClick={() => setModalIsOpen(false)}
                            className={concatClassnames('__close-modal-btn')}
                        >
                            x
                        </button>

                        <video
                            className={concatClassnames('__video')}
                            src={screenRecorder.videoUrl ?? ''}
                            controls
                        ></video>

                        <textarea className={concatClassnames('__text-area')} />

                        <div className={concatClassnames('__actions')}>
                            <button
                                className={concatClassnames('__cancel-btn')}
                            >
                                {getTranslation('cancelButtonTitle')}
                            </button>
                            <button
                                onClick={() => {
                                    screenRecorder.downloadFile()
                                    requestRecorder.downloadFile()
                                }}
                                className={concatClassnames('__donwload-btn')}
                            >
                                {getTranslation('downloadButtonTitle')}
                            </button>
                            <button
                                className={concatClassnames('__upload-btn')}
                            >
                                {getTranslation('uploadButtonTitle')}
                            </button>
                        </div>
                    </section>
                </div>
            ) : null}
        </>
    )
}

export default ReactBugReporterProWrapper
