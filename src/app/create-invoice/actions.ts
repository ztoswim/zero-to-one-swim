'use server';

import { db } from "@/db";
import { invoices, lessons, students } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getCurrentUserProfile } from "@/app/staff-access/actions";

export async function createInvoiceAction(formData: any) {
  try {
    const { invId, invoiceData, schedule } = formData;
    const profile = await getCurrentUserProfile();

    // 1. Create Invoice
    await db.insert(invoices).values({
      id: invId,
      invoiceNumber: invoiceData.invoiceNumber,
      studentId: invoiceData.studentId,
      coachId: invoiceData.coachId,
      packageId: invoiceData.packageId,
      totalAmount: invoiceData.totalAmount.toString(),
      transportFee: invoiceData.transportFee.toString(),
      paymentMethod: invoiceData.paymentMethod,
      paymentDate: invoiceData.paymentDate,
      lessonsRemaining: invoiceData.lessonsRemaining,
      status: 'paid',
      createdBy: profile?.id || null,
    });


    // 2. Create Lessons
    if (schedule && schedule.length > 0) {
      const lessonValues = schedule.map((slot: any) => ({
        invoiceId: invId,
        studentId: invoiceData.studentId,
        coachId: invoiceData.coachId,
        date: slot.date,
        time: slot.time,
        duration: invoiceData.duration || 45,
        status: 'scheduled',
      }));
      await db.insert(lessons).values(lessonValues);
    }

    revalidatePath('/');
    revalidatePath('/schedule');
    revalidatePath('/create-invoice');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: (error as Error).message };
  }
}
