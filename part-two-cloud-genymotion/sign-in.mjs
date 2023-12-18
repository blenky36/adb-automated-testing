import { assertScreenContains, clickOnElement, execCommand } from "./util.mjs";
import {
  DescribeInstancesCommand,
  TerminateInstancesCommand,
  RunInstancesCommand,
  waitUntilInstanceRunning,
  EC2Client,
} from "@aws-sdk/client-ec2";

const ZOOM_PACKAGE_NAME = "us.zoom.videomeetings";
const EMAIL = "";
const PASSWORD = "";
const CUSTOM_GENYMOTION_AMI_ID = "ami-xxxxxx";
const SECURITY_GROUP_ID = "sg-xxxxxx";
const ec2Client = new EC2Client({ region: "xx-xxxx-x" });

console.log("Launching Genymotion Device Image EC2");
const { Instances } = await ec2Client.send(
  new RunInstancesCommand({
    MinCount: 1,
    MaxCount: 1,
    ImageId: CUSTOM_GENYMOTION_AMI_ID,
    InstanceType: "c6g.xlarge",
    BlockDeviceMappings: [
      {
        DeviceName: "/dev/sda1",
        Ebs: {
          VolumeSize: 10,
          VolumeType: "gp2",
          DeleteOnTermination: true,
        },
      },
    ],
    SecurityGroupIds: [SECURITY_GROUP_ID],
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [
          {
            Key: "Name",
            Value: "Genymotion-ADB-Testing",
          },
        ],
      },
    ],
  })
);
const genymotionInstanceId = Instances?.[0]?.InstanceId ?? "";
console.log("Waiting for Genymotion Device Image EC2 to initialise");
await waitUntilInstanceRunning(
  {
    client: ec2Client,
    maxWaitTime: 30,
  },
  {
    Filters: [{ Name: "instance-id", Values: [genymotionInstanceId] }],
  }
);
console.log("Fetching Genymotion Device Image EC2 public IP address");
const instance = await ec2Client.send(
  new DescribeInstancesCommand({
    Filters: [{ Name: "instance-id", Values: [genymotionInstanceId] }],
  })
);
const genymotionPublicIpAddress =
  instance?.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress || "";
  if (!genymotionPublicIpAddress) {
    console.log("No Genymotion public IP. Exiting");
    throw new Error("No IP");
  }

console.log("Connecting to Genymotion EC2");
await execCommand(`adb connect ${genymotionPublicIpAddress}:5555`);

console.log("Installing APK...");
await execCommand("adb install-multiple ../zoom-apk/*.apk");
console.log("APK Installed!");
console.log("Launching APK...");
await execCommand(
  `adb shell am start "${ZOOM_PACKAGE_NAME}/$(adb shell cmd package resolve-activity -c android.intent.category.LAUNCHER ${ZOOM_PACKAGE_NAME} | sed -n '/name=/s/^.*name=//p')"`
);
console.log("APK Launched!");

await clickOnElement("Sign In");
await clickOnElement("Email");
await execCommand(`adb shell input text "${EMAIL}"`);
await clickOnElement("Password");
await execCommand(`adb shell input text "${PASSWORD}"`);
await clickOnElement("Sign In");

await assertScreenContains(`Meetings`);

console.log("Terminating Genymotion Device Image EC2");
await ec2Client.send(
  new TerminateInstancesCommand({
    InstanceIds: [genymotionInstanceId],
  })
);
