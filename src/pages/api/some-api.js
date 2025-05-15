// Example: pages/api/some-api.js
import dbConnect from '../../../lib/mongodb';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  await dbConnect();
  // Use prisma here, for example:
  const users = await prisma.user.findMany();
  res.status(200).json(users);
}
