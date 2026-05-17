"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Lists ---
export async function getLists() {
  return prisma.shoppingList.findMany({
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createList(name: string, color: string, icon: string) {
  const list = await prisma.shoppingList.create({
    data: { name, color, icon }
  });
  revalidatePath("/");
  return list;
}

export async function deleteList(id: string) {
  await prisma.shoppingList.delete({
    where: { id }
  });
  revalidatePath("/");
}

// --- Items ---
export async function addItem(listId: string, name: string, category: string, quantity: string) {
  const item = await prisma.shoppingItem.create({
    data: { listId, name, category, quantity }
  });
  revalidatePath("/");
  return item;
}

export async function toggleItemChecked(id: string, checked: boolean) {
  const item = await prisma.shoppingItem.update({
    where: { id },
    data: { checked }
  });
  revalidatePath("/");
  return item;
}

export async function updateItemQuantity(id: string, quantity: string) {
  const item = await prisma.shoppingItem.update({
    where: { id },
    data: { quantity }
  });
  revalidatePath("/");
  return item;
}

export async function updateItemName(id: string, name: string) {
  const item = await prisma.shoppingItem.update({
    where: { id },
    data: { name }
  });
  revalidatePath("/");
  return item;
}

export async function deleteItem(id: string) {
  await prisma.shoppingItem.delete({
    where: { id }
  });
  revalidatePath("/");
}

// --- Activities ---
export async function getActivities() {
  return prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

export async function logActivity(action: string, target: string, userName: string) {
  await prisma.activity.create({
    data: { action, target, userName }
  });
  revalidatePath("/");
}
