import "dotenv/config";
import { db } from "@/db";
import { coaches, students } from "@/db/schema";

async function createTestData() {
  try {
    console.log("Creating test coaches and students...");

    // Create 2 Coaches
    const newCoaches = [
      {
        name: "Coach Alan",
        nickname: "Alan",
        phone: "012-3456789",
        gender: "Male",
        email: "alan@test.com",
      },
      {
        name: "Coach Bella",
        nickname: "Bella",
        phone: "012-9876543",
        gender: "Female",
        email: "bella@test.com",
      }
    ];

    await db.insert(coaches).values(newCoaches);
    console.log("Coaches created successfully!");

    // Create 4 Students
    const newStudents = [
      {
        name: "Daniel Lim",
        phone: "011-11112222",
        gender: "Male",
        status: "active",
      },
      {
        name: "Emma Tan",
        phone: "011-33334444",
        gender: "Female",
        status: "active",
      },
      {
        name: "Felix Wong",
        phone: "011-55556666",
        gender: "Male",
        status: "active",
      },
      {
        name: "Grace Ng",
        phone: "011-77778888",
        gender: "Female",
        status: "active",
      }
    ];

    await db.insert(students).values(newStudents);
    console.log("Students created successfully!");

    console.log("All test data created successfully!");
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}

createTestData();
