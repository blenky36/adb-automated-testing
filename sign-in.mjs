import { assertScreenContains, clickOnElement, execCommand } from "./util.mjs";

const ZOOM_PACKAGE_NAME = "us.zoom.videomeetings";
const EMAIL = "" 
const PASSWORD = ""

// Assumes emulator is already running

console.log("Installing APK...");
await execCommand("adb install-multiple ./zoom-apk/*.apk");
console.log("APK Installed!");
console.log("Launching APK...");
await execCommand(
  `adb shell am start "${ZOOM_PACKAGE_NAME}/$(adb shell cmd package resolve-activity -c android.intent.category.LAUNCHER ${ZOOM_PACKAGE_NAME} | sed -n '/name=/s/^.*name=//p')"`
);
console.log("APK Launched!");

await clickOnElement("Sign In")
await clickOnElement("Email")
await execCommand(`adb shell input text "${EMAIL}"`)
await clickOnElement("Password")
await execCommand(`adb shell input text "${PASSWORD}"`)
await clickOnElement("Sign In")

await assertScreenContains(`Meetings`)

console.log("Uninstalling APK...");
await execCommand(`adb uninstall ${ZOOM_PACKAGE_NAME}`);
console.log("APK Uninstalled!");
