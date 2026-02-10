import fs from 'fs';
import path from 'path';

const EVENTS_ROOT = path.join(__dirname, 'domain/entities');


function pascalToSnake(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .toLowerCase();
}

function fixEventFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');

  if (!content.includes('extends DomainEvent')) return;

  const classMatch = content.match(/export class (\w+) extends DomainEvent/);
  if (!classMatch) return;

  const className = classMatch[1];
  const eventName = pascalToSnake(className);

  let fixed = content;

  // 1️⃣ Constructor
  if (!/constructor\(/.test(content)) {
    fixed = fixed.replace(
      /extends DomainEvent\s*{/,
      `extends DomainEvent {
  constructor(eventId?: string, occurredOn?: Date) {
    super(eventId, occurredOn);
  }`
    );
  } else {
    // Si ya hay constructor, agrega super si no existe
    if (!/super\(/.test(content)) {
      fixed = fixed.replace(
        /constructor\s*\(([^)]*)\)\s*{/,
        `constructor($1) {\n    super();`
      );
    }
  }

  // 2️⃣ getEventName()
  if (!/getEventName\(\)/.test(fixed)) {
    fixed += `

  getEventName(): string {
    return '${eventName}';
  }`;
  }

  // 3️⃣ toPrimitives()
  if (!/toPrimitives\(\)/.test(fixed)) {
    fixed += `

  toPrimitives(): Record<string, unknown> {
    return {};
  }`;
  }

  fs.writeFileSync(filePath, fixed, 'utf-8');
  console.log(`✅ Fixed: ${filePath}`);
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) walkDir(fullPath);
    else if (file.endsWith('.ts')) fixEventFile(fullPath);
  }
}

walkDir(EVENTS_ROOT);
console.log('🎯 Todos los eventos procesados.');
