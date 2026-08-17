import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useLanguage } from '../../context/LanguageContext';

export const HelpCenterPage: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      category: t.faq1Category,
      question: t.faq1Question,
      answer: t.faq1Answer
    },
    {
      category: t.faq2Category,
      question: t.faq2Question,
      answer: t.faq2Answer
    },
    {
      category: t.faq3Category,
      question: t.faq3Question,
      answer: t.faq3Answer
    },
    {
      category: t.faq4Category,
      question: t.faq4Question,
      answer: t.faq4Answer
    },
    {
      category: t.faq5Category,
      question: t.faq5Question,
      answer: t.faq5Answer
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container container-narrow" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div
          className="icon-container-3d-cyan"
          style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', margin: '0 auto 1rem auto' }}
        >
          <HelpCircle size={28} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
          {t.helpCenterTitle}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
          {t.helpCenterSubtitle}
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <Card
              key={index}
              style={{
                padding: '0',
                border: isOpen ? '1.5px solid var(--color-accent-400)' : '1px solid var(--color-border)',
                transition: 'border-color var(--transition-fast)'
              }}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '12px'
                }}
                aria-expanded={isOpen}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-600)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                    {faq.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                    {faq.question}
                  </h3>
                </div>

                <div
                  style={{
                    color: isOpen ? 'var(--color-accent-600)' : 'var(--color-text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <ChevronDown size={20} />
                </div>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem 1.5rem',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1rem',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.925rem',
                    lineHeight: 1.6
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
