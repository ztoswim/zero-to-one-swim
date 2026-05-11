import "dotenv/config";
import { db } from "@/db";
import { packages } from "@/db/schema";

const d2dPackages = [
  // 45 Mins D2D A
  { name: "D2D A 1v1 (1 Session)", lessonCount: 1, price: "120.00", transportFee: "30.00", type: "Door to Door", pax: 1 },
  { name: "D2D A 1v1 (4 Sessions)", lessonCount: 4, price: "400.00", transportFee: "100.00", type: "Door to Door", pax: 1 },
  { name: "D2D A 1v1 (10 Sessions)", lessonCount: 10, price: "950.00", transportFee: "200.00", type: "Door to Door", pax: 1 },
  
  { name: "D2D A 1v2 (1 Session)", lessonCount: 1, price: "200.00", transportFee: "30.00", type: "Door to Door", pax: 2 },
  { name: "D2D A 1v2 (4 Sessions)", lessonCount: 4, price: "640.00", transportFee: "100.00", type: "Door to Door", pax: 2 },
  { name: "D2D A 1v2 (10 Sessions)", lessonCount: 10, price: "1500.00", transportFee: "200.00", type: "Door to Door", pax: 2 },
  
  { name: "D2D A 1v3 (1 Session)", lessonCount: 1, price: "270.00", transportFee: "30.00", type: "Door to Door", pax: 3 },
  { name: "D2D A 1v3 (4 Sessions)", lessonCount: 4, price: "861.00", transportFee: "99.00", type: "Door to Door", pax: 3 },
  { name: "D2D A 1v3 (10 Sessions)", lessonCount: 10, price: "1962.00", transportFee: "198.00", type: "Door to Door", pax: 3 },
  
  { name: "D2D A 1v4 (1 Session)", lessonCount: 1, price: "330.00", transportFee: "30.00", type: "Door to Door", pax: 4 },
  { name: "D2D A 1v4 (4 Sessions)", lessonCount: 4, price: "1000.00", transportFee: "100.00", type: "Door to Door", pax: 4 },
  { name: "D2D A 1v4 (10 Sessions)", lessonCount: 10, price: "2300.00", transportFee: "200.00", type: "Door to Door", pax: 4 },

  // 90 Mins D2D A
  { name: "90D2D A 1v1 (4 Sessions)", lessonCount: 4, price: "640.00", transportFee: "100.00", type: "Door to Door", pax: 1 },
  { name: "90D2D A 1v1 (10 Sessions)", lessonCount: 10, price: "1450.00", transportFee: "200.00", type: "Door to Door", pax: 1 },
  { name: "90D2D A 1v2 (4 Sessions)", lessonCount: 4, price: "880.00", transportFee: "100.00", type: "Door to Door", pax: 2 },
  { name: "90D2D A 1v2 (10 Sessions)", lessonCount: 10, price: "2000.00", transportFee: "200.00", type: "Door to Door", pax: 2 },
  { name: "90D2D A 1v3 (4 Sessions)", lessonCount: 4, price: "1101.00", transportFee: "99.00", type: "Door to Door", pax: 3 },
  { name: "90D2D A 1v3 (10 Sessions)", lessonCount: 10, price: "2472.00", transportFee: "198.00", type: "Door to Door", pax: 3 },
  { name: "90D2D A 1v4 (4 Sessions)", lessonCount: 4, price: "1240.00", transportFee: "100.00", type: "Door to Door", pax: 4 },
  { name: "90D2D A 1v4 (10 Sessions)", lessonCount: 10, price: "2800.00", transportFee: "200.00", type: "Door to Door", pax: 4 },
];

async function importD2DPackages() {
  try {
    console.log("Importing D2D A packages...");
    await db.insert(packages).values(d2dPackages);
    console.log("D2D A packages imported successfully!");
  } catch (error) {
    console.error("Error importing packages:", error);
  }
}

importD2DPackages();
