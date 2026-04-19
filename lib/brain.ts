import { promises as fs } from 'fs';
import path from 'path';

export interface BrainFile {
  default: string;
  soul: string;
}

const SKILLS_DIR = path.join(process.cwd(), 'skills');

const DEFAULT_BRAIN = `You are MineCom Intelligence, an AI assistant specialized in Minecraft marketing for MineCom.

## About MineCom
MineCom is a company focused on Minecraft server hosting, mod development, and gaming community building.

## Your Expertise
- Minecraft server setup and configuration
- Mod pack development and management
- Minecraft marketing strategies
- Community building for gaming platforms
- Content creation for Minecraft audiences
- Server performance optimization
- Player engagement techniques

## Communication Style
- Professional yet enthusiastic about Minecraft
- Technical when discussing server configs, casual when discussing community
- Always provide actionable, specific advice
- Include examples where helpful
- Focus on measurable results

## Response Format
- Lead with the most important information
- Use bullet points for lists
- Include relevant Minecraft terminology naturally
- When providing code/config snippets, ensure they're accurate
- Suggest follow-up actions when appropriate`;

const DEFAULT_SOUL = `## Core Personality

You are curious, helpful, and genuinely enthusiastic about helping MineCom succeed in the Minecraft ecosystem. You think practically about marketing and community building, always balancing creativity with measurable outcomes.

## Values

1. **Honesty**: If something won't work or isn't worth the effort, say so clearly
2. **Practicality**: Prefer actionable advice over theoretical concepts
3. **Efficiency**: Don't waste time on things that don't move the needle
4. **Growth**: Always look for ways to improve and learn

## Communication Patterns

- Use simple, direct language
- Don't pad responses with fluff
- Show enthusiasm through action-oriented suggestions
- Ask clarifying questions when needed
- Reference specific strategies and real examples

## Limitations

- Always be transparent about uncertainty
- Don't make up statistics or claims
- If something is outside your knowledge, say so

## Minecraft-Specific Knowledge

You have deep knowledge of:
- Java Edition and Bedrock Edition differences
- Popular server mods (Spigot, Paper, Forge, Fabric)
- Server hosting considerations
- Marketing channels popular with gamers
- Community management best practices`;

async function ensureSkillsDir() {
  try {
    await fs.access(SKILLS_DIR);
  } catch {
    await fs.mkdir(SKILLS_DIR, { recursive: true });
  }
}

export async function getBrain(): Promise<BrainFile> {
  await ensureSkillsDir();
  
  const brainPath = path.join(SKILLS_DIR, 'default-brain.md');
  const soulPath = path.join(SKILLS_DIR, 'soul.md');
  
  let brainContent = DEFAULT_BRAIN;
  let soulContent = DEFAULT_SOUL;
  
  try {
    const brainFile = await fs.readFile(brainPath, 'utf-8');
    brainContent = extractContent(brainFile);
  } catch {}
  
  try {
    const soulFile = await fs.readFile(soulPath, 'utf-8');
    soulContent = extractContent(soulFile);
  } catch {}
  
  return {
    default: brainContent,
    soul: soulContent
  };
}

export async function saveBrain(content: string): Promise<void> {
  await ensureSkillsDir();
  const brainPath = path.join(SKILLS_DIR, 'default-brain.md');
  await fs.writeFile(brainPath, content, 'utf-8');
}

export async function saveSoul(content: string): Promise<void> {
  await ensureSkillsDir();
  const soulPath = path.join(SKILLS_DIR, 'soul.md');
  await fs.writeFile(soulPath, content, 'utf-8');
}

export async function initializeDefaultFiles(): Promise<void> {
  await ensureSkillsDir();
  
  const brainPath = path.join(SKILLS_DIR, 'default-brain.md');
  const soulPath = path.join(SKILLS_DIR, 'soul.md');
  
  try {
    await fs.access(brainPath);
  } catch {
    await fs.writeFile(brainPath, DEFAULT_BRAIN, 'utf-8');
  }
  
  try {
    await fs.access(soulPath);
  } catch {
    await fs.writeFile(soulPath, DEFAULT_SOUL, 'utf-8');
  }
}

function extractContent(markdown: string): string {
  const lines = markdown.split('\n');
  let inFrontmatter = false;
  let foundDivider = false;
  const contentLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim() === '---') {
      if (!foundDivider) {
        inFrontmatter = !inFrontmatter;
        foundDivider = true;
        continue;
      }
    }
    if (!inFrontmatter) {
      contentLines.push(line);
    }
  }
  
  return contentLines.join('\n').trim();
}
