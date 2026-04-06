import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRootDirectory = path.resolve(currentDirectory, '../../..');

export function loadBackendEnvironment(): void {
  loadEnvFile(path.join(backendRootDirectory, '.env'));
}

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const fileContents = readFileSync(filePath, 'utf8');

  for (const line of fileContents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.length === 0 ||
      trimmedLine.startsWith('#') ||
      !trimmedLine.includes('=')
    ) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (key.length === 0 || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = stripWrappingQuotes(rawValue);
  }
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
