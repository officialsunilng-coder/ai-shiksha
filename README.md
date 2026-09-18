# AI Shiksha — Offline learning demo

AI Shiksha is an offline-first learning application for students in grades 5–10.
This repository hosts the hackathon browser demo and cross-platform offline
application downloads.

## Scan and test

![AI Shiksha demo QR code](site/qr-code.png)

Open the QR landing page:

`https://officialsunilng-coder.github.io/ai-shiksha/demo.html`

The browser demo includes:

- Six learning modules and 24 assessed lessons
- Five guided projects and locally saved project journals
- Offline ML Studio with calibrated text classification, MobileNet-powered
  multi-image classification, and numeric clustering
- Editable project titles, automatic local saving, and JSON project export/import
- Locally saved learner progress and PDF progress export
- Responsive layouts for desktop, Android tablets, and iPad

## Downloads

- **Windows:** Download the 1.68 GB installer from the QR page. It includes the
  Granite 3.3 2B model, llama.cpp runtime, and offline Generative AI Tutor.
- **Android:** Download the 702 MB version 1.1 APK for the bundled mobile
  Granite Tutor, or the 43 MB Lite APK when conversational tutoring is not
  required.
- **iPhone/iPad:** Open the browser app in Safari and use **Share → Add to Home
  Screen**. The native offline-Tutor project is Xcode-ready but still requires
  Apple signing and TestFlight distribution.
- **Mac:** Use the Safari or Chrome browser app. There is currently no native
  macOS installer or offline Generative AI Tutor.

## Generative AI Tutor availability

The course and ML Studio run in the browser without a language-model download.
The **Generative AI Tutor** is included in the Windows installer and full
Android APK. It is unavailable in the browser/PWA edition.

## Privacy

The demo has no analytics, advertising, user account, or cloud inference.
Learning records and ML Studio projects are stored in the browser or application
storage on the current device. See [the privacy notice](site/privacy.html).

## Package verification

Windows offline Tutor installer:

`ShikshaAI-Granite-Lite-0.1.0-Setup.exe`

SHA-256:

`879ED3E973CB2DD7AEAED2357604D027C1FEAA5C4FDCFD4B0F709C82C0FB84A9`

Android offline Tutor APK:

`AI-Shiksha-Android-Offline-Tutor-1.1-debug.apk`

SHA-256:

`7E3ECD581D42D92CDA6BFF2DA44FEC80226408EE7D522387081C6FBFE62EDFC9`

Android Lite APK:

`site/downloads/ShikshaAI-Android-Demo.apk`

SHA-256:

`B9E2EE999BD3EB58E12D930B292471B10711C1F3ED9F0B7B5511DCB022A36A11`

The Android packages are debug-signed hackathon builds, not Play Store
production releases.

## Deployment

GitHub Actions publishes the contents of `site` to GitHub Pages whenever `main`
is updated. The workflow uses GitHub's official Pages actions.

Demo package date: September 18, 2026.
