import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Get file structure (just file paths, not content)
 */
export async function getFileStructure(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await getFileStructure(fullPath);
        files.push(...subFiles.map(f => join(entry.name, f)));
      } else {
        files.push(entry.name);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files.sort();
}
