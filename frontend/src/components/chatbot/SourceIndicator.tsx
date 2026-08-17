import React from 'react';
import { Database, BookOpen, ShieldCheck } from 'lucide-react';
import { ChatSource } from '../../services/chatbotService';

interface SourceIndicatorProps {
  sources?: ChatSource[];
}

export const SourceIndicator: React.FC<SourceIndicatorProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {sources.map((src, idx) => {
        const isRAG = src.type.includes('rag') || src.type.includes('knowledge') || src.type.includes('guideline');
        return (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.68rem',
              fontWeight: 600,
              backgroundColor: isRAG ? '#fffbeb' : '#ecfdf5',
              color: isRAG ? '#b45309' : '#047857',
              border: isRAG ? '1px solid #fde68a' : '1px solid #a7f3d0'
            }}
          >
            {isRAG ? (
              <BookOpen size={11} color="#b45309" />
            ) : (
              <Database size={11} color="#047857" />
            )}
            <span>{src.label}</span>
            <ShieldCheck size={11} color="#10b981" style={{ marginLeft: '2px' }} />
          </span>
        );
      })}
    </div>
  );
};
