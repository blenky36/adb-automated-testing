# ADB E2E Automated Testing
Run black box E2E tests on an android app using an android emulator in the cloud

https://medium.com/@philblenk6/android-automated-testing-in-the-cloud-using-genymotion-device-image-359f1024aece

Requirements:
1. Android Studio 
    - Can be installed from https://developer.android.com/studio
    - Should also install adb, avdmanager, sdkmanager 
2. AWS CLI
    - Install from https://aws.amazon.com/cli/
    - Should be configured to access an AWS account (run `aws configure`)
3. Node.js v18.17
    - NVM is recommended to install and manage node versions
4. Yarn package manager
    - Run `yarn -v` to check if installed. If not run `npm i -g yarn`


Usage:
1. Run `yarn install` from the root of the repository
2. Run `node sign-in.mjs`

