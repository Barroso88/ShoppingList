"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function getFamilyId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Não autenticado");
  }
  return (session.user as any).familyId || "default-family";
}

// --- Family Management ---
export async function getFamilyCode() {
  return await getFamilyId();
}

export async function updateFamilyCode(code: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Não autenticado");
  }
  const userId = (session.user as any).id;
  const trimmedCode = code.trim().toLowerCase();
  if (!trimmedCode) throw new Error("Código inválido");

  const user = await prisma.user.update({
    where: { id: userId },
    data: { familyId: trimmedCode }
  });
  
  revalidatePath("/");
  return user.familyId;
}

export async function getFamilyMembers() {
  const familyId = await getFamilyId();
  const users = await prisma.user.findMany({
    where: { familyId }
  });
  return users.map(u => ({
    id: u.id,
    name: u.name || 'Membro',
    role: (u.role === 'Admin' ? 'Admin' : 'Membro') as 'Membro' | 'Admin',
    avatar: u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
    email: u.email || ''
  }));
}

// --- Lists ---
export async function getLists() {
  const familyId = await getFamilyId();
  return prisma.shoppingList.findMany({
    where: { familyId },
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createList(name: string, color: string, icon: string) {
  const familyId = await getFamilyId();
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  const list = await prisma.shoppingList.create({
    data: { name, color, icon, familyId, ownerId: userId }
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
  const familyId = await getFamilyId();
  return prisma.activity.findMany({
    where: { familyId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

export async function logActivity(action: string, target: string, userName: string) {
  const familyId = await getFamilyId();
  await prisma.activity.create({
    data: { action, target, userName, familyId }
  });
  revalidatePath("/");
}

// --- Recipes ---
export async function getRecipes() {
  const familyId = await getFamilyId();
  return prisma.savedRecipe.findMany({
    where: { familyId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function saveRecipe(title: string, description: string, emoji: string, ingredients: any, instructions: any) {
  const familyId = await getFamilyId();
  const recipe = await prisma.savedRecipe.create({
    data: { title, description, emoji, ingredients, instructions, familyId }
  });
  revalidatePath("/");
  return recipe;
}

export async function deleteRecipe(id: string) {
  await prisma.savedRecipe.delete({
    where: { id }
  });
  revalidatePath("/");
}

// --- AI Generation ---
import { GoogleGenAI } from '@google/genai';

export async function generateRecipeWithAI(prompt: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'Chave de API do Gemini não configurada no servidor (GEMINI_API_KEY).' };
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful chef from Portugal. The user wants a recipe based on: "${prompt}".
      CRITICAL: You must write EVERYTHING in strict European Portuguese (Português de Portugal). DO NOT use Brazilian terms (e.g. use 'frigorífico' instead of 'geladeira', 'natas' instead of 'creme de leite', 'fiambre' instead of 'presunto', etc.).
      Return ONLY a JSON object with the following structure:
      {
        "title": "Recipe Name",
        "description": "Short description",
        "emoji": "🍲",
        "ingredients": [
          { "name": "Ingredient 1", "quantity": "1 cup", "category": "Despensa" },
          { "name": "Ingredient 2", "quantity": "2", "category": "Frutas e Legumes" }
        ],
        "instructions": [
          "Passo 1...",
          "Passo 2..."
        ]
      }`,
      config: { responseMimeType: "application/json" }
    });
    
    if (!response.text) {
      return { error: 'A IA não devolveu nenhum texto.' };
    }
    
    let rawText = response.text.trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }
    return { success: true, data: JSON.parse(rawText) };
  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return { error: error.message || 'Erro interno ao gerar receita.' };
  }
}

// --- Pantry ---
export async function getPantryItems() {
  const familyId = await getFamilyId();
  return prisma.pantryItem.findMany({
    where: { familyId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addPantryItem(name: string, quantity: string, category: string) {
  const familyId = await getFamilyId();
  const item = await prisma.pantryItem.create({
    data: { name, quantity, category, familyId }
  });
  revalidatePath("/");
  return item;
}

export async function updatePantryItemQuantity(id: string, quantity: string) {
  const item = await prisma.pantryItem.update({
    where: { id },
    data: { quantity }
  });
  revalidatePath("/");
  return item;
}

export async function updatePantryItemName(id: string, name: string) {
  const item = await prisma.pantryItem.update({
    where: { id },
    data: { name }
  });
  revalidatePath("/");
  return item;
}

export async function deletePantryItem(id: string) {
  await prisma.pantryItem.delete({
    where: { id }
  });
  revalidatePath("/");
}
