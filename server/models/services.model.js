import { prisma } from "../prismaClient.js";

export async function listServices() {
  return prisma.service.findMany({ orderBy: { id: "asc" } });
}

export async function getServiceById(id) {
  return prisma.service.findUnique({ where: { id } });
}

export async function createService({ title, description, price, durationMin }) {
  return prisma.service.create({
    data: {
      title,
      description,
      price: Number(price),
      durationMin: Number(durationMin),
    },
  });
}

export async function patchService(id, data) {
  const exists = await prisma.service.findUnique({ where: { id } });
  if (!exists) return null;

  return prisma.service.update({
    where: { id },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      price: data.price !== undefined ? Number(data.price) : undefined,
      durationMin: data.durationMin !== undefined ? Number(data.durationMin) : undefined,
    },
  });
}

export async function deleteService(id) {
  const exists = await prisma.service.findUnique({ where: { id } });
  if (!exists) return false;
  await prisma.service.delete({ where: { id } });
  return true;
}