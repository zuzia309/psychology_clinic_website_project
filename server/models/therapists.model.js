// server/models/therapists.model.js
import { prisma } from "../prismaClient.js";

export async function listTherapists() {
  return prisma.therapist.findMany({ orderBy: { id: "asc" } });
}

export async function getTherapistById(id) {
  return prisma.therapist.findUnique({ where: { id } });
}

export async function createTherapist({ name, role, bio, imageUrl }) {
  return prisma.therapist.create({
    data: { name, role, bio, imageUrl: imageUrl || null },
  });
}

export async function patchTherapist(id, data) {
  const exists = await prisma.therapist.findUnique({ where: { id } });
  if (!exists) return null;

  return prisma.therapist.update({
    where: { id },
    data: {
      name: data.name ?? undefined,
      role: data.role ?? undefined,
      bio: data.bio ?? undefined,
      imageUrl: data.imageUrl ?? undefined,
    },
  });
}

export async function deleteTherapist(id) {
  const exists = await prisma.therapist.findUnique({ where: { id } });
  if (!exists) return false;
  await prisma.therapist.delete({ where: { id } });
  return true;
}