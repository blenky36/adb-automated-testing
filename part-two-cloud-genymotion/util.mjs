import { exec } from "child_process";
import { xml2json } from "xml-js";
import traverse from "traverse";

export const execCommand = async (command) => {
  return new Promise((resolve, _) => {
    exec(command, (__, stdout, stderr) => {
      if (stderr && !stdout) {
        console.error(`Stderr: ${stderr.trim()}`);
        resolve(stderr.trim());
      }
      resolve(stdout.trim());
    });
  });
};
export const sleep = (secondsDelay) =>
  new Promise((resolve) => setTimeout(() => resolve(), secondsDelay * 1000));

export const retryAction = async (maxRetries, description, action) =>
  new Promise(async (resolve, reject) => {
    let attempt = 1;
    while (attempt <= maxRetries) {
      const success = await action();
      if (success) {
        break;
      }
      console.info(
        `Attempt ${attempt}/${maxRetries} to ${description}. Retrying in 1s`
      );
      attempt++;
      await sleep(1);
    }
    if (attempt > maxRetries) {
      reject(new Error(`Failed to ${description}`));
    }
    resolve();
  });

const printScreenXml = async () =>
  execCommand(
    `adb exec-out uiautomator dump /dev/tty | awk '{gsub("UI hierchary dumped to: /dev/tty", "");print}'`
  );

const findElementCenterCoordinates = (
  xmlString,
  xmlAccessor,
  elementContent
) => {
  try {
    const xmlJson = JSON.parse(xml2json(xmlString, { compact: true }));
    let elementBoundString = undefined;
    traverse(xmlJson).forEach(function (_) {
      if (!this.node[xmlAccessor]) return;
      if (this.node[xmlAccessor] === elementContent) {
        elementBoundString = this.node?.bounds;
      }
    });
    if (!elementBoundString) return [];
    const [xMin, yMin, xMax, yMax] = elementBoundString
      .match(new RegExp(/\d+/g))
      .map(Number);
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    return [centerX, centerY];
  } catch (error) {
    console.log("ERR", error);
    return [];
  }
};

export const clickOnElement = async (
  elementContent,
  xmlPathAccessor = "text"
) =>
  retryAction(3, `click ${elementContent}`, async () => {
    console.info(`Finding ${elementContent}`);
    const xmlStringResponse = await printScreenXml();
    if (xmlStringResponse.includes("<?xml")) {
      const [x, y] = findElementCenterCoordinates(
        xmlStringResponse,
        xmlPathAccessor,
        elementContent
      );
      if (x && y) {
        console.info(`${elementContent} center coordinates (${x}, ${y})`);
        await execCommand(`adb shell input tap ${x} ${y}`);
        return true;
      }
    }
    return false;
  });

export const assertScreenContains = async (elementContent) =>
  retryAction(3, `find ${elementContent}`, async () => {
    const xmlStringResponse = await printScreenXml();
    if(xmlStringResponse.includes(elementContent)) {
        console.log(`Screen contains ${elementContent} ✅`)
        return true
    }
    return false
  });
