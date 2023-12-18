# ADB E2E Automated Testing
Run black box E2E tests on an android app using a local android emulator

https://medium.com/@philblenk6/e2e-testing-android-apps-with-adb-b0d667cfe44b

Requirements:
1. Android Studio 
    - Can be installed from https://developer.android.com/studio
    - Should also install adb, avdmanager, sdkmanager 
2. Android Virtual Device created and running
    - Example used SDK `system-images;android-33;google_apis_playstore;arm64-v8a`
    - Device was Nexus 5X
    - Command to install and create: `sdkmanager "system-images;android-33;google_apis_playstore;arm64-v8a" && echo "no" | avdmanager -v create avd -f -n N5X33P -k "system-images;android-33;google_apis_playstore;`
    - Emulator can then be run using `emulator @N5X33P` where N5X33P is the name of the virtual device created previously (Nexus 5X running Android 33 with playstore)
3. Node.js v18.17
    - NVM is recommended to install and manage node versions
4. Yarn package manager
    - Run `yarn -v` to check if installed. If not run `npm i -g yarn`


Usage:
1. Run `yarn install` from the root of the repository
2. Run `node sign-in.mjs`

