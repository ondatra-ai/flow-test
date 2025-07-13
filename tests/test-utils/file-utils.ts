import { promises as fs } from 'fs';
import { join, resolve } from 'path';

/**
 * Copy a directory recursively
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

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

/**
 * Copy a flow file to the test directory's .flows/flows folder
 */
export async function copyFlowFile(
  flowFileName: string,
  tempTestDir: string,
  sourceDir = 'data/flow-execution'
): Promise<void> {
  const flowsDir = join(tempTestDir, '.flows', 'flows');
  await fs.mkdir(flowsDir, { recursive: true });

  const sourcePath = resolve(
    __dirname,
    '..',
    'integration',
    sourceDir,
    flowFileName
  );
  const destPath = join(flowsDir, flowFileName);

  await fs.copyFile(sourcePath, destPath);
}

/**
 * Copy multiple flow files to the test directory
 */
export async function copyFlowFiles(
  flowFileNames: string[],
  tempTestDir: string,
  sourceDir = 'data/flow-execution'
): Promise<void> {
  for (const fileName of flowFileNames) {
    await copyFlowFile(fileName, tempTestDir, sourceDir);
  }
}

/**
 * Create a flows directory structure for testing
 */
export async function setupFlowsDirectory(tempTestDir: string): Promise<void> {
  const flowsDir = join(tempTestDir, '.flows', 'flows');
  const serversDir = join(tempTestDir, '.flows', 'servers');

  await fs.mkdir(flowsDir, { recursive: true });
  await fs.mkdir(serversDir, { recursive: true });
}
