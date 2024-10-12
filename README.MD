# REACT BUG REPORTER PRO

**_React Bug Reporter Pro_** is a lightweight React component library designed to streamline bug reporting by enabling users to simultaneously record all HTTP requests, screen activity, and audio. This approach enhances the detail and accuracy of bug reports. The library offers a flexible and robust solution for monitoring and controlling HTTP interactions and screen recordings, and it includes comprehensive type definitions to enhance the development experience for consumers.

_Note: Due to compatibility limitations, mobile browsers are not supported._

## Installation

Install the package using npm:

```bash
npm install react-bug-reporter-pro
```

## Features

-   HTTP and Video Recording: Simultaneously capture all background HTTP requests and record screen activity.

-   Intuitive Interface: A simple and interactive user interface makes bug capturing straightforward and user-friendly.

-   Fully Customizable: Designed with flexibility and reusability in mind, this library can easily adapt to any style. For highly customized implementations, all core logic is encapsulated in two hooks, making it easy to create your own components using them.

-   Customizable Translations: Due to its customizable nature, the library includes built-in support for translations, allowing you to tailor it to fit your language and specific context.

-   Comprehensive Documentation: Clear and detailed JSDoc comments and type definitions are provided throughout the API, ensuring a smooth development experience right out of the box.

## Usage

**_With the built in wrapper_**

```tsx
import { ReactBugReporterProWrapper } from 'react-bug-reporter-pro'

const MyComponent: React.FC = () => {
    // ... any code here ...

    return (
        <Foo>
            // ...any jsx you might have here
            <ReactBugReporterProWrapper
                description={description}
                setDescription={setDescription}
                allowDownloadFiles={true}
                audioEnabled={true}
            />
        </Foo>
    )
}
```

The code above provides everything you need to get started with the library. It allows you to download the recorded video and the HTTP request log file after the recording.

If you wish to upload the files to a server, you'll need to implement a bit more logic, such as:

```tsx
import { ReactBugReporterProWrapper } from 'react-bug-reporter-pro'

const MyComponent: React.FC = () => {
    // ... any code here ...

    return (
        <Foo>
            // ...any other JSX code you might have here
            <ReactBugReporterProWrapper
                description={description}
                setDescription={setDescription}
                allowDownloadFiles={true}
                audioEnabled={true}
                uploadFiles={{
                    uploadVideoCallback: (videoEncoded) => {
                        return fetch('your-service-url', {
                            method: 'POST',
                            body: videoEncoded,
                            headers: {
                                Authorization:
                                    'Bearer your-auth-token if required',
                            },
                        })
                    },
                    uploadRequestFileCallback: (httpLogFileEncoded) => {
                        return fetch('your-service-url', {
                            method: 'POST',
                            body: httpLogFileEncoded,
                            headers: {
                                Authorization:
                                    'Bearer your-auth-token if required',
                            },
                        })
                    },
                }}
                onFileUploaded={async ({
                    requestsFileUploadResult,
                    videoUploadResult,
                    error,
                }) => {
                    /*
                     * This callback receives the responses from the previous upload callbacks,
                     * allowing you to perform any required actions, such as sending a POST request
                     * to save the file URLs along with the description.
                     */

                    if (error) {
                        /*
                         * If an error occurs during any of the upload callbacks, the 'error' property
                         * will be available here for you to handle it accordingly. It is possible for one
                         * of the two upload callbacks to succeed while the other fails. In such a case,
                         * 'requestsFileUploadResult' and 'videoUploadResult' will still be accessible,
                         * allowing you to determine which upload failed and handle the successful one as needed.
                         */
                    }

                    try {
                        const data = {
                            description,
                            videoUrl: await videoUploadResult.json().url,
                            httpLogUrl:
                                await requestsFileUploadResult.json().url,
                        }

                        await fetch('my-server-url', {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization:
                                    'Bearer your-auth-token if required',
                            },
                        })
                    } catch (error) {
                        console.log({ error })
                    }
                }}
            />
        </Foo>
    )
}
```

**_Using the hooks_**

If you want to develop your custom UI and use either the HTTP logger, the screen recorder, or both, you can utilize the _useHttpRecorder_ and/or _useScreenRecorder_ hooks. These hooks encapsulate all the logic found in the built-in wrapper, allowing you to implement functionality in an isolated manner.

**_useHttpRecorder_**

This hook allows you to record all background HTTP requests.

Using it will likely look like this:

```typescript
import { useHttpRecorder } from 'react-bug-reporter-pro'

const myComponent: React.FC = () => {
    const {
        downloadFile,
        recording,
        startRecording,
        stopRecording,
        uploadFile,
    } = useHttpRecorder()

    const onStartRecording = () => {
        if (recording) return
        startRecording()
    }

    const onStopRecording = () => {
        stopRecorder('optional-file-name')
        downloadFile()
    }

    const onUploadFile = () => {
        try {
            await uploadFile((httpLogFile) => {
                /* Your upload logic goes here */
            })
        } catch (error) {
            //...error handling
        }
    }

    return //...any jsx here
}
```

**_useHttpRecorder_**

This hook enables you to record the screen. Its API is quite similar to that of the HTTP logger hook.

Using it will likely look like this:

```typescript
import { useScreenRecorder } from 'react-bug-reporter-pro'

const myComponent: React.FC = () => {
    const {
        recording,
        localVideoUrl,
        startRecording,
        stopRecording,
        uploadFile,
        revokeUrl,
        downloadFile,
    } = useScreenRecorder()

    const onStartRecording = () => {
        if (recording) return;
        startRecording()
    }

    const onStopRecording = () => {
        stopRecorder('optional-file-name')
        downloadFile()
    }

    const onUploadFile = () => {
        try {
            await uploadFile((videoFileEncoded) => {
                /* Your upload logic goes here */
            })

            revokeUrl()
        } catch (error) {
            //...error handling
        }
    }

    return <video src={localVideoUrl}></video>
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the [MIT License](LICENSE).

This software is and will always be completely free to use, even for commercial purposes. You don’t need to ask for any kind of permission to use it as you please. However, if you would like to support the project and contribute, donations in Bitcoin are accepted — any sats are welcome!

**Bitcoin Donation Address:** `bc1qkk46335s70yr7suz50m4ryfplvrxwmpy325d92`
