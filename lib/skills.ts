import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  usageCount: number;
}

const SKILLS_DIR = path.join(process.cwd(), 'skills');

async function ensureSkillsDir() {
  try {
    await fs.access(SKILLS_DIR);
  } catch {
    await fs.mkdir(SKILLS_DIR, { recursive: true });
  }
}

export async function getAllSkills(): Promise<Skill[]> {
  await ensureSkillsDir();
  
  try {
    const files = await fs.readdir(SKILLS_DIR);
    const skills: Skill[] = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const content = await fs.readFile(path.join(SKILLS_DIR, file), 'utf-8');
        const skill = parseSkillFromMarkdown(file, content);
        if (skill) skills.push(skill);
      }
    }
    
    return skills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function getSkillById(id: string): Promise<Skill | null> {
  await ensureSkillsDir();
  
  const files = await fs.readdir(SKILLS_DIR);
  for (const file of files) {
    if (file.endsWith('.md') && file.startsWith(id)) {
      const content = await fs.readFile(path.join(SKILLS_DIR, file), 'utf-8');
      return parseSkillFromMarkdown(file, content);
    }
  }
  return null;
}

export async function createSkill(data: { name: string; description: string; content: string; tags?: string[] }): Promise<Skill> {
  await ensureSkillsDir();
  
  const id = uuidv4().slice(0, 8);
  const now = new Date().toISOString();
  const tags = data.tags || [];
  
  const skill: Skill = {
    id,
    name: data.name,
    description: data.description,
    content: data.content,
    createdAt: now,
    updatedAt: now,
    tags,
    usageCount: 0
  };
  
  const filename = `${id}-${slugify(data.name)}.md`;
  const filePath = path.join(SKILLS_DIR, filename);
  
  const markdown = formatSkillAsMarkdown(skill);
  await fs.writeFile(filePath, markdown, 'utf-8');
  
  return skill;
}

export async function updateSkill(id: string, data: Partial<Skill>): Promise<Skill | null> {
  await ensureSkillsDir();
  
  const skill = await getSkillById(id);
  if (!skill) return null;
  
  const updatedSkill: Skill = {
    ...skill,
    ...data,
    id: skill.id,
    createdAt: skill.createdAt,
    updatedAt: new Date().toISOString()
  };
  
  const files = await fs.readdir(SKILLS_DIR);
  for (const file of files) {
    if (file.startsWith(id)) {
      const filePath = path.join(SKILLS_DIR, file);
      await fs.writeFile(filePath, formatSkillAsMarkdown(updatedSkill), 'utf-8');
      return updatedSkill;
    }
  }
  
  return null;
}

export async function deleteSkill(id: string): Promise<boolean> {
  await ensureSkillsDir();
  
  const files = await fs.readdir(SKILLS_DIR);
  for (const file of files) {
    if (file.startsWith(id)) {
      await fs.unlink(path.join(SKILLS_DIR, file));
      return true;
    }
  }
  return false;
}

export async function incrementSkillUsage(id: string): Promise<void> {
  const skill = await getSkillById(id);
  if (skill) {
    await updateSkill(id, { usageCount: skill.usageCount + 1 });
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

function parseSkillFromMarkdown(filename: string, content: string): Skill | null {
  try {
    const id = filename.split('-')[0];
    const lines = content.split('\n');
    let name = filename.replace('.md', '');
    let description = '';
    let inContent = false;
    let contentLines: string[] = [];
    let tags: string[] = [];
    let createdAt = new Date().toISOString();
    let updatedAt = new Date().toISOString();
    let usageCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('---')) {
        inContent = !inContent;
        continue;
      }
      
      if (inContent) {
        contentLines.push(line);
        continue;
      }
      
      if (line.startsWith('name:') || line.startsWith('name: ')) {
        name = line.replace(/^name:\s*/, '').trim();
      } else if (line.startsWith('description:') || line.startsWith('description: ')) {
        description = line.replace(/^description:\s*/, '').trim();
      } else if (line.startsWith('tags:') || line.startsWith('tags: ')) {
        tags = line.replace(/^tags:\s*/, '').split(',').map(t => t.trim()).filter(Boolean);
      } else if (line.startsWith('created:') || line.startsWith('created: ')) {
        createdAt = line.replace(/^created:\s*/, '').trim();
      } else if (line.startsWith('updated:') || line.startsWith('updated: ')) {
        updatedAt = line.replace(/^updated:\s*/, '').trim();
      } else if (line.startsWith('usage:') || line.startsWith('usage: ')) {
        usageCount = parseInt(line.replace(/^usage:\s*/, '').trim(), 10) || 0;
      }
    }
    
    return {
      id,
      name,
      description,
      content: contentLines.join('\n').trim(),
      createdAt,
      updatedAt,
      tags,
      usageCount
    };
  } catch {
    return null;
  }
}

function formatSkillAsMarkdown(skill: Skill): string {
  return `---
name: ${skill.name}
description: ${skill.description}
tags: ${skill.tags.join(', ')}
created: ${skill.createdAt}
updated: ${skill.updatedAt}
usage: ${skill.usageCount}
---

${skill.content}
`;
}
