import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";

async function addD2DTrainingV3() {
  try {
    console.log("Adding D2D Training 1v3 packages...");

    const trainingPkgs = [
      {
        name: "DOOR 2 DOOR (A) 1V3 Training - 4 Sessions",
        type: "Door to Door",
        pax: 3,
        lessonCount: 4,
        price: "861.00",
        transportFee: "99.00", // Total 960
      },
      {
        name: "DOOR 2 DOOR (A) 1V3 Training - 10 Sessions",
        type: "Door to Door",
        pax: 3,
        lessonCount: 10,
        price: "1962.00",
        transportFee: "198.00", // Total 2160
      }
    ];

    await db.insert(packages).values(trainingPkgs);
    console.log("D2D Training 1v3 packages added successfully!");
  } catch (error) {
    console.error("Error adding training packages:", error);
  }
}

addD2DTrainingV3();
