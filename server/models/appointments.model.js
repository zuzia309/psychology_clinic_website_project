import { prisma } from "../prismaClient.js";

export async function listAppointments() {
  return prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      therapist: true,
    },
  });
}

export async function createAppointment({ fullName, email, phone, serviceId, therapistId, scheduledAt, note }) {
  return prisma.appointment.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      note: note || null,
      scheduledAt: new Date(scheduledAt),
      serviceId: Number(serviceId),
      therapistId: Number(therapistId),
    },
    include: {
      service: true,
      therapist: true,
    },
  });
}

export async function patchAppointment(id, { scheduledAt, note }) {
  const data = {};
  if (scheduledAt) data.scheduledAt = new Date(scheduledAt);
  if (note !== undefined) data.note = note || null;

  return prisma.appointment.update({
    where: { id },
    data,
    include: {
      service: true,
      therapist: true,
    },
  });
}

export async function deleteAppointment(id) {
  await prisma.appointment.delete({ where: { id } });
  return true;
}