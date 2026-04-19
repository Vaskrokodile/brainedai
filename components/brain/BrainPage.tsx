'use client';

import { useState } from 'react';
import { Plus, X, Trash2, BookOpen, Sparkles, Edit2, Save } from 'lucide-react';
import { useBrain, Skill } from '@/context/BrainContext';
import { Button, Textarea, Input } from '@/components/ui';
import styles from './BrainPage.module.css';

type TabType = 'skills' | 'brain' | 'soul';

export function BrainPage() {
  const { skills, loading, brainContent, soulContent, createSkill, updateSkill, deleteSkill, saveBrain, saveSoul } = useBrain();
  const [activeTab, setActiveTab] = useState<TabType>('skills');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  const handleCreateSkill = async () => {
    if (!editName.trim() || !editContent.trim()) return;
    
    await createSkill({
      name: editName,
      description: editDescription,
      content: editContent,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
    });
    
    setIsCreating(false);
    setEditContent('');
    setEditName('');
    setEditDescription('');
    setEditTags('');
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setEditName(skill.name);
    setEditDescription(skill.description);
    setEditContent(skill.content);
    setEditTags(skill.tags.join(', '));
  };

  const handleUpdateSkill = async () => {
    if (!selectedSkill || !editName.trim() || !editContent.trim()) return;
    
    await updateSkill(selectedSkill.id, {
      name: editName,
      description: editDescription,
      content: editContent,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean)
    });
    
    setSelectedSkill(null);
  };

  const handleDeleteSkill = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      await deleteSkill(id);
    }
  };

  const handleSaveBrain = async () => {
    await saveBrain(editContent);
    setSelectedSkill(null);
  };

  const handleSaveSoul = async () => {
    await saveSoul(editContent);
    setSelectedSkill(null);
  };

  const startEditBrain = () => {
    setSelectedSkill({ id: 'brain', name: 'Default Brain', description: '', content: brainContent, createdAt: '', updatedAt: '', tags: [], usageCount: 0 } as Skill);
    setEditContent(brainContent);
  };

  const startEditSoul = () => {
    setSelectedSkill({ id: 'soul', name: 'Soul', description: '', content: soulContent, createdAt: '', updatedAt: '', tags: [], usageCount: 0 } as Skill);
    setEditContent(soulContent);
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (selectedSkill) {
    const isBrainFile = selectedSkill.id === 'brain';
    const isSoulFile = selectedSkill.id === 'soul';
    
    return (
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.modalContent} style={{ maxWidth: '100%', height: '100%' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isBrainFile ? 'Default Brain' : isSoulFile ? 'Soul File' : 'Edit Skill'}
              </h2>
              <button className={styles.modalClose} onClick={() => setSelectedSkill(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {!isBrainFile && !isSoulFile && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name</label>
                  <input
                    className={styles.formInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              )}
              {!isBrainFile && !isSoulFile && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <input
                    className={styles.formInput}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Content</label>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </div>
              {!isBrainFile && !isSoulFile && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tags (comma-separated)</label>
                  <input
                    className={styles.formInput}
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => setSelectedSkill(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={isBrainFile ? handleSaveBrain : isSoulFile ? handleSaveSoul : handleUpdateSkill}
              >
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.modalContent} style={{ maxWidth: '100%', height: '100%' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Skill</h2>
              <button className={styles.modalClose} onClick={() => setIsCreating(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  className={styles.formInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Server Marketing 101"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input
                  className={styles.formInput}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief description of this skill"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Content</label>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="The actual skill content..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags (comma-separated)</label>
                <input
                  className={styles.formInput}
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="marketing, minecraft, servers"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateSkill}>
                <Save size={16} />
                Create Skill
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Brain Center</h1>
            <p className={styles.subtitle}>Manage skills, brain, and soul files</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <Plus size={16} />
              New Skill
            </Button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'skills' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <BookOpen size={14} style={{ marginRight: 6 }} />
            Skills ({skills.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'brain' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('brain')}
          >
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Brain
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'soul' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('soul')}
          >
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Soul
          </button>
        </div>

        {activeTab === 'skills' && (
          <>
            {skills.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🧠</div>
                <h3 className={styles.emptyTitle}>No skills yet</h3>
                <p className={styles.emptyText}>Create your first skill to expand the AI&apos;s knowledge.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {skills.map((skill) => (
                  <div key={skill.id} className={styles.card} onClick={() => handleEditSkill(skill)}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{skill.name}</h3>
                      <button
                        className={styles.cardDelete}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSkill(skill.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className={styles.cardDescription}>{skill.description}</p>
                    <div className={styles.cardMeta}>
                      <span>{skill.usageCount} uses</span>
                      <span>•</span>
                      <span>{new Date(skill.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {skill.tags.length > 0 && (
                      <div className={styles.cardTags}>
                        {skill.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'brain' && (
          <div className={styles.card} onClick={startEditBrain}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Default Brain</h3>
              <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className={styles.cardDescription}>
              The default brain file contains system-level instructions that shape how the AI responds.
              Edit this to customize the AI&apos;s core behavior and expertise.
            </p>
            <div className={styles.cardMeta}>
              <span>System instructions</span>
            </div>
          </div>
        )}

        {activeTab === 'soul' && (
          <div className={styles.card} onClick={startEditSoul}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Soul File</h3>
              <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className={styles.cardDescription}>
              The soul file defines the AI&apos;s personality, values, and communication patterns.
              Edit this to shape how the AI expresses itself.
            </p>
            <div className={styles.cardMeta}>
              <span>Personality & values</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
