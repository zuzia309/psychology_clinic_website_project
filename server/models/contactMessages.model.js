// server/models/contactMessages.model.js
import { prisma } from "../prismaClient.js";

export async function listContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createContactMessage({ fullName, email, phone, message }) {
  return prisma.contactMessage.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      message,
    },
  });
}

export async function deleteContactMessage(id) {
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}