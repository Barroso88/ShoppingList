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

// --- Recipes ---
export async function getRecipes() {
  return prisma.savedRecipe.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function saveRecipe(title: string, description: string, emoji: string, ingredients: any, instructions: any) {
  const recipe = await prisma.savedRecipe.create({
    data: { title, description, emoji, ingredients, instructions }
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
