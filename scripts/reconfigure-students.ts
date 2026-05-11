import { db } from "../src/db";
import { students, studentFixedSlots } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const alanId = "bda71b53-699e-485b-a999-8e7338191541";
  const bellaId = "04c2c591-6151-4472-aef5-01ad9e2e9b3f";
  const akademikId = "01574f35-28dc-4ca3-90c9-a1b979386f4d";
  const ambienceId = "96fb6e4a-ac7f-4fab-91f4-105f15a37934";

  const data = [
    {
      id: "9ee61c5e-104c-4efe-ab72-7ab80b4702e2", // Daniel Lim
      coachId: alanId,
      locationId: akademikId,
      duration: 45,
      slots: [{ day: "Monday", time: "18:00", duration: 45, coachId: alanId }]
    },
    {
      id: "6aa72b57-fc78-46c7-954b-8a7c1d9345e1", // Emma Tan
      coachId: bellaId,
      locationId: ambienceId,
      duration: 30,
      slots: [
        { day: "Tuesday", time: "17:00", duration: 30, coachId: bellaId },
        { day: "Thursday", time: "17:00", duration: 30, coachId: bellaId }
      ]
    },
    {
      id: "2e8499f6-56c2-4b66-b562-baa42d8fdd08", // Felix Wong
      coachId: alanId,
      locationId: akademikId,
      duration: 30,
      slots: [{ day: "Wednesday", time: "19:00", duration: 30, coachId: alanId }]
    },
    {
      id: "f4d91e8d-3a79-410d-b72b-dc08de735708", // Grace Ng
      coachId: bellaId,
      locationId: ambienceId,
      duration: 45,
      slots: [
        { day: "Saturday", time: "10:00", duration: 45, coachId: bellaId },
        { day: "Sunday", time: "10:00", duration: 45, coachId: bellaId }
      ]
    }
  ];

  for (const s of data) {
    console.log(`Updating ${s.id}...`);
    // Update student info
    await db.update(students).set({
      coachId: s.coachId,
      locationId: s.locationId,
      lessonDuration: s.duration
    }).where(eq(students.id, s.id));

    // Delete old slots
    await db.delete(studentFixedSlots).where(eq(studentFixedSlots.studentId, s.id));

    // Insert new slots
    if (s.slots.length > 0) {
      await db.insert(studentFixedSlots).values(
        s.slots.map(slot => ({
          studentId: s.id,
          coachId: slot.coachId,
          day: slot.day,
          time: slot.time,
          duration: slot.duration
        }))
      );
    }
  }

  console.log("Done!");
}

main().catch(console.error);
