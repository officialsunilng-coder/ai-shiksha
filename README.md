# AI Shiksha — Offline learning demo

AI Shiksha is an offline-first learning application for students in grades 5–10.
This repository hosts the hackathon browser demo and Android test package.

## Scan and test

![AI Shiksha demo QR code](site/qr-code.png)

Open the QR landing page:

`https://sunilnan_microsoft.github.io/ai-shiksha/demo.html`

The browser demo includes:

- Six learning modules and 24 assessed lessons
- Five guided projects and locally saved project journals
- Offline ML Studio with calibrated text classification, MobileNet-powered
  multi-image classification, and numeric clustering
- Editable project titles, automatic local saving, and JSON project export/import
- Locally saved learner progress and PDF progress export
- Responsive layouts for desktop, Android tablets, and iPad

## Downloads

- **Browser and iPad:** Open the QR page, select **Start browser demo**, and optionally use **Add to Home Screen**.
- **Android:** Download `ShikshaAI-Android-Demo.apk` from the QR page. Android may require permission to install an app from the browser.
- **Windows:** Use the browser demo for public testing. The complete Windows package contains a multi-gigabyte offline language model and is not stored in this repository.
- **iOS/TestFlight:** The native iOS project is implemented separately but still requires macOS/Xcode signing and TestFlight submission.

## Important model limitation

The course and ML Studio run in the browser without a language-model download.
The **AI Tutor** requires the separately installed Granite model and native
runtime, so it is unavailable in the GitHub Pages browser demo and in the APK
until that model content pack is copied to the device.

## Privacy

The demo has no analytics, advertising, user account, or cloud inference.
Learning records and ML Studio projects are stored in the browser or application
storage on the current device. See [the privacy notice](site/privacy.html).

## Android package verification

Published APK:

`site/downloads/ShikshaAI-Android-Demo.apk`

SHA-256:

`B9E2EE999BD3EB58E12D930B292471B10711C1F3ED9F0B7B5511DCB022A36A11`

This is a debug-signed hackathon build, not a Play Store production release.

## Deployment

GitHub Actions publishes the contents of `site` to GitHub Pages whenever `main`
is updated. The workflow uses GitHub's official Pages actions.

Demo package date: September 18, 2026.
