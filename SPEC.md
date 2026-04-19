# Minecom AI Chat - Specification

## Concept & Vision

A sleek, professional AI chat interface for Minecom's Minecraft marketing operations. The experience feels like conversing with an elite marketing intelligence system—sharp, sophisticated, and endlessly capable. The liquid glass aesthetic creates depth and premium tactile feel while the monochrome palette exudes technical competence.

## Design Language

### Aesthetic Direction
Liquid glass minimalism—translucent surfaces with subtle blur, depth through layering, sharp typographic hierarchy. Think: high-end creative tool meets enterprise dashboard.

### Color Palette
- `--bg-deep`: #0a0a0a (deepest background)
- `--bg-surface`: #141414 (card/panel surfaces)
- `--bg-elevated`: #1a1a1a (elevated elements)
- `--glass`: rgba(255,255,255,0.03) (glass surfaces)
- `--glass-border`: rgba(255,255,255,0.08) (glass borders)
- `--text-primary`: #ffffff
- `--text-secondary`: #888888
- `--text-muted`: #555555
- `--accent`: #ffffff (pure white accents)
- `--accent-dim`: rgba(255,255,255,0.5)

### Typography
- Primary: `Inter` (UI text)
- Mono: `JetBrains Mono` (code, technical content)
- Scale: 12px/14px/16px/20px/28px/48px

### Spatial System
- Base unit: 4px
- Spacing: 8, 12, 16, 24, 32, 48, 64px
- Border radius: 8px (small), 16px (medium), 24px (large), 9999px (pill)
- Glass blur: 20px backdrop-filter

### Motion Philosophy
- Transitions: 200ms ease-out (micro), 400ms ease-out (panels), 600ms ease-out (page)
- Chat messages: slide-up fade-in, staggered 50ms
- Panels: slide-in from edge with subtle scale
- Hover states: 150ms color/opacity transitions

## Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (280px)  │  Main Chat Area (flex-1)               │
│  ┌─────────────┐  │  ┌─────────────────────────────────┐   │
│  │ Logo        │  │  │ Chat Header                     │   │
│  │             │  │  ├─────────────────────────────────┤   │
│  │ Navigation  │  │  │                                 │   │
│  │ - Chat      │  │  │ Messages                         │   │
│  │ - Brain     │  │  │                                 │   │
│  │             │  │  │                                 │   │
│  │ Model       │  │  ├─────────────────────────────────┤   │
│  │ Selector    │  │  │ Input Area                      │   │
│  │             │  │  └─────────────────────────────────┘   │
│  │ Skills List │  │                                         │
│  └─────────────┘  │                                         │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop (>1024px): Full sidebar + chat
- Tablet (768-1024px): Collapsible sidebar
- Mobile (<768px): Bottom nav, full-screen chat

## Features & Interactions

### 1. Chat System
- **Message input**: Auto-expanding textarea, max 200px height
- **Send**: Enter to send, Shift+Enter for newline
- **Streaming**: Real-time token streaming with typewriter effect
- **Markdown**: Full markdown rendering with code syntax highlighting
- **Image upload**: Drag-drop or click to attach images (for vision)
- **Online browsing**: Toggle to enable web search for queries

### 2. Model Selection
- **Grok**: xAI's Grok-2 with browsing
- **Gemini**: Google's Gemini 2.0 Flash (vision + speed)
- **Fusion**: Parallel queries, combine best responses
- **Expertise levels**:
  - Normal: Fast, concise responses
  - High: Balanced depth and speed
  - Extra High: Thorough, detailed responses
  - Max: Maximum depth, all capabilities enabled

### 3. Brain System (Sidebar Page)
- **Skills list**: All saved skills with search/filter
- **Skill card**: Title, preview, created date, actions
- **Skill editor**: Full markdown editor with preview
- **Default brain**: System instructions every chat starts with
- **Soul file**: Personality/character definition

### 4. Skills Management
- **Auto-save**: AI can trigger skill creation mid-conversation
- **Manual create**: Button to create new skill
- **Edit/Delete**: Full CRUD operations
- **Import/Export**: JSON format for backup

### 5. Settings
- API key management (stored in localStorage with warning)
- Theme adjustments (glass intensity)
- Clear conversation button
- Export all skills

## Component Inventory

### ChatMessage
- **States**: user, assistant, system, error
- **Features**: Timestamp, copy button, regenerate, edit (user only)
- **Streaming**: Pulsing indicator during generation

### GlassPanel
- **Appearance**: Semi-transparent background, blur backdrop, subtle border
- **States**: default, hover (border brightens), active

### SkillCard
- **Appearance**: Glass panel with title, preview text, metadata
- **States**: default, hover (lift + border glow), selected

### ModelSelector
- **Appearance**: Segmented control with icons
- **States**: Each option has default, hover, selected

### ExpertiseSlider
- **Appearance**: 4-step segmented control
- **Labels**: Normal, High, Extra High, Max

### ChatInput
- **Appearance**: Glass panel, large textarea, action buttons
- **States**: empty, typing, sending, disabled
- **Actions**: Send, attach image, toggle browsing

### SidebarNav
- **Items**: Chat, Brain, Settings
- **States**: Each item has default, hover, active (current page)

## Technical Approach

### Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + CSS Variables
- **State**: React Context + useReducer
- **Storage**: localStorage for skills, sessionStorage for API keys
- **AI APIs**: 
  - Grok (xAI) - https://api.x.ai/v1
  - Gemini (Google AI) - https://generativelanguage.googleapis.com/v1beta

### API Design

#### POST /api/chat
```json
Request:
{
  "messages": [{role, content, image?}],
  "model": "grok" | "gemini" | "fusion",
  "expertise": "normal" | "high" | "extra_high" | "max",
  "browse": boolean,
  "brain": string (system prompt),
  "soul": string (personality prompt)
}

Response: 
- Streaming: text/event-stream with tokens
- Final: {content, skills_created?}
```

#### GET /api/skills
```json
Response: { skills: [{id, title, content, created_at}] }
```

#### POST /api/skills
```json
Request: { title, content }
Response: { id, title, content, created_at }
```

#### PUT /api/skills/:id
```json
Request: { title?, content? }
Response: { id, title, content, updated_at }
```

#### DELETE /api/skills/:id
```json
Response: { success: true }
```

### Data Model
```typescript
interface Skill {
  id: string;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
}

interface BrainFile {
  default: string; // default brain content
  soul: string;   // personality/character
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // base64 for vision
  timestamp: number;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
  expertise: string;
  browse_enabled: boolean;
}
```

### Model Selection for Vision
- **Gemini 2.0 Flash**: Best balance of cost, speed, vision capability
- Vision via base64 image input
- Cost: ~$0.0015 per image

### Optimization
- Message virtualization for long conversations
- Debounced auto-save (500ms)
- Lazy loading for skill content
- Optimistic UI updates
