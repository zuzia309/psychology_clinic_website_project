import { prisma } from "../server/prismaClient.js";

async function main() {
  const res = await prisma.appointment.deleteMany({});
  console.log("Usunięto wizyt:", res.count);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });