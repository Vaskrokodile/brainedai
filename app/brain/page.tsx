'use client';

import React, { useState, useEffect } from 'react';
import { useBrain } from '@/context/BrainContext';
import { Plus, Save, Trash2, Edit2, X, Check, FileText, Sparkles } from 'lucide-react';
import { MiniSidebar } from '@/components/MiniSidebar';
import styles from './page.module.css';

type TabType = 'skills' | 'brain' | 'soul';

export default function BrainPage() {
  const { skills, brainContent, soulContent, saveBrain, saveSoul, createSkill, updateSkill, deleteSkill, refreshSkills, loading } = useBrain();
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillForm, setSkillForm] = useState({ name: '', description: '', content: '', tags: '' });
  const [brainText, setBrainText] = useState(brainContent);
  const [soulText, setSoulText] = useState(soulContent);
  const [saving, setSaving] = useState(false);
  const [showNewSkill, setShowNewSkill] = useState(false);

  useEffect(() => {
    setBrainText(brainContent);
  }, [brainContent]);

  useEffect(() => {
    setSoulText(soulContent);
  }, [soulContent]);

  const handleSaveBrain = async () => {
    setSaving(true);
    try {
      await saveBrain(brainText);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSoul = async () => {
    setSaving(true);
    try {
      await saveSoul(soulText);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSkill = async () => {
    if (!skillForm.name || !skillForm.content) return;
    
    try {
      await createSkill({
        name: skillForm.name,
        description: skillForm.description,
        content: skillForm.content,
        tags: skillForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setSkillForm({ name: '', description: '', content: '', tags: '' });
      setShowNewSkill(false);
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await deleteSkill(id);
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  return (
    <>
      <MiniSidebar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Brain</h1>
          <p className={styles.subtitle}>Manage your AI's knowledge, personality, and skills</p>
        </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'skills' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills ({skills.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'brain' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('brain')}
        >
          Default Brain
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'soul' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('soul')}
        >
          Soul
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'skills' && (
          <div className={styles.skillsTab}>
            <div className={styles.skillsHeader}>
              <button className={styles.newSkillBtn} onClick={() => setShowNewSkill(true)}>
                <Plus size={16} />
                New Skill
              </button>
            </div>

            {showNewSkill && (
              <div className={styles.skillForm}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    placeholder="e.g., Minecraft Server Marketing"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <input
                    type="text"
                    value={skillForm.description}
                    onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={skillForm.tags}
                    onChange={(e) => setSkillForm({ ...skillForm, tags: e.target.value })}
                    placeholder="minecraft, marketing, servers"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Content</label>
                  <textarea
                    value={skillForm.content}
                    onChange={(e) => setSkillForm({ ...skillForm, content: e.target.value })}
                    placeholder="The actual skill content..."
                    rows={8}
                  />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowNewSkill(false)}>
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={handleCreateSkill}>
                    <Check size={16} />
                    Create Skill
                  </button>
                </div>
              </div>
            )}

            <div className={styles.skillsList}>
              {loading ? (
                <div className={styles.loading}>Loading skills...</div>
              ) : skills.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={48} strokeWidth={1} />
                  <p>No skills yet. Create your first skill to extend the AI's knowledge.</p>
                </div>
              ) : (
                skills.map((skill) => (
                  <div key={skill.id} className={styles.skillCard}>
                    <div className={styles.skillHeader}>
                      <h3 className={styles.skillName}>{skill.name}</h3>
                      <div className={styles.skillActions}>
                        <button onClick={() => handleDeleteSkill(skill.id)} className={styles.deleteBtn}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {skill.description && (
                      <p className={styles.skillDescription}>{skill.description}</p>
                    )}
                    <div className={styles.skillMeta}>
                      <span>{skill.tags?.join(', ') || 'No tags'}</span>
                      <span>Used {skill.usageCount} times</span>
                    </div>
                    <div className={styles.skillContent}>
                      {skill.content.slice(0, 150)}
                      {skill.content.length > 150 && '...'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'brain' && (
          <div className={styles.editorTab}>
            <div className={styles.editorHeader}>
              <h2>Default Brain</h2>
              <p>The base system instructions that define the AI's core purpose and expertise</p>
            </div>
            <textarea
              className={styles.editor}
              value={brainText}
              onChange={(e) => setBrainText(e.target.value)}
              placeholder="Enter brain content..."
            />
            <div className={styles.editorActions}>
              <button className={styles.saveBtn} onClick={handleSaveBrain} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Brain'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'soul' && (
          <div className={styles.editorTab}>
            <div className={styles.editorHeader}>
              <h2>Soul</h2>
              <p>Define the AI's personality, communication style, and character</p>
            </div>
            <textarea
              className={styles.editor}
              value={soulText}
              onChange={(e) => setSoulText(e.target.value)}
              placeholder="Enter soul content..."
            />
            <div className={styles.editorActions}>
              <button className={styles.saveBtn} onClick={handleSaveSoul} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Soul'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
