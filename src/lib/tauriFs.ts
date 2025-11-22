import { browser } from '$app/environment';
import type { DirEntry, BaseDirectory } from '@tauri-apps/plugin-fs';

//This file is a bit stupid

// Check if we're running inside Tauri
export function isRunningInTauri(): boolean {
  return browser && typeof (window as any).__TAURI__ !== 'undefined';
}

// Dynamically load fs plugin at runtime
async function getFs() {
  if (!isRunningInTauri()) throw new Error('Tauri fs is not available outside Tauri.');
  return await import('@tauri-apps/plugin-fs');
}

// Safe wrapper for exists
export async function existsSafe(path: string): Promise<boolean> {
  if (!isRunningInTauri()) return false;
  try {
    const fs = await getFs();
    return await fs.exists(path);
  } catch {
    return false;
  }
}

// Safe wrapper for createDir
export async function createDirSafe(path: string): Promise<boolean> {
  if (!isRunningInTauri()) return false;

  try {
    const fs = await getFs();
    await fs.create(path); // Tauri v2 does not use dir/recursive here
    return true;
  } catch {
    return false;
  }
}

// Safe wrapper for readDir
export async function readDirSafe(path: string): Promise<DirEntry[]> {
  if (!isRunningInTauri()) return [];
  try {
    const fs = await getFs();
    return await fs.readDir(path);
  } catch {
    return [];
  }
}

// Safe wrapper for readTextFile
export async function readTextFileSafe(path: string): Promise<string> {
  if (!isRunningInTauri()) return '';
  try {
    const fs = await getFs();
    return await fs.readTextFile(path);
  } catch {
    return '';
  }
}

// Return BaseDirectory constants safely
export async function getBaseDirectory(): Promise<typeof BaseDirectory> {
  if (!isRunningInTauri()) throw new Error('Tauri fs is not available outside Tauri.');
  const fs = await getFs();
  return fs.BaseDirectory;
}
