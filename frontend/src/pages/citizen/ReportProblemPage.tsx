import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Send, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { ComplaintAnalysisResult, SimilarIssueMatch } from '../../lib/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar, StepItem } from '../../components/common/ProgressBar';
import { Step1Describe } from '../../components/report/Step1Describe';
import { Step2Location } from '../../components/report/Step2Location';
import { Step3Evidence } from '../../components/report/Step3Evidence';
import { Step4AIReview } from '../../components/report/Step4AIReview';
import { SimilarIssuesModal } from '../../components/report/SimilarIssuesModal';
import { Step5FinalReview } from '../../components/report/Step5FinalReview';
import { SubmissionSuccess } from '../../components/report/SubmissionSuccess';

export const ReportProblemPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language: currentAppLang, t } = useLanguage();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [description, setDescription] = useState('');
  const [inputLang, setInputLang] = useState<string>(currentAppLang);
  const [area, setArea] = useState(profile?.area || 'Gokulam');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [duration, setDuration] = useState('not_sure');
  const [accidentReported, setAccidentReported] = useState(false);
  const [accidentDescription, setAccidentDescription] = useState('');

  // AI Analysis & Similarity state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysisResult | null>(null);
  const [similarMatches, setSimilarMatches] = useState<SimilarIssueMatch[]>([]);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [submissionResult, setSubmissionResult] = useState<{
    complaintId: string;
    issueId: string;
    issueTitle: string;
    status: string;
    wasLinked: boolean;
  } | null>(null);

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const WIZARD_STEPS: StepItem[] = [
    { step: 1, label: t.stepDescribe },
    { step: 2, label: t.stepLocation },
    { step: 3, label: t.stepEvidence },
    { step: 4, label: t.stepAIReview },
    { step: 5, label: t.stepSubmit }
  ];

  // Navigation handlers
  const handleNext = async () => {
    setFieldErrors({});

    // Step 1 Validation
    if (currentStep === 1) {
      if (!description.trim() || description.trim().length < 10) {
        setFieldErrors({ description: t.step1ErrorMinChars });
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Step 2 Validation
    if (currentStep === 2) {
      if (!area.trim()) {
        setFieldErrors({ area: t.step2AreaLabel });
        return;
      }
      setCurrentStep(3);
      return;
    }

    // Step 3 Validation & Trigger AI Analysis
    if (currentStep === 3) {
      if (accidentReported && !accidentDescription.trim()) {
        warning(t.step3AccidentDescLabel);
        return;
      }
      setCurrentStep(4);
      runAIAnalysis();
      return;
    }

    // Step 4 to Step 5 (Guard against rejected non-civic input)
    if (currentStep === 4) {
      if (!analysisResult) {
        warning(t.step4AnalyzingTitle);
        return;
      }
      if (analysisResult.is_civic_issue === false) {
        warning(t.rejectionTitle, analysisResult.rejection_reason || t.rejectionSubtitle);
        return;
      }
      setCurrentStep(5);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Run AI Analysis & Similarity Search
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Call AI Analysis
      const analysis = await api.analyzeComplaint({
        original_text: description,
        language: inputLang,
        area,
        landmark,
        accident_reported: accidentReported,
        accident_description: accidentDescription,
        duration
      });
      setAnalysisResult(analysis);

      // 2. If valid civic issue, call Similarity Search to detect existing matching issues
      if (analysis.is_civic_issue !== false) {
        const simRes = await api.findSimilarIssues({
          text: description,
          category: analysis.category,
          area: area || analysis.area,
          landmark: landmark || analysis.landmark || undefined
        });

        if (simRes.found_matches && simRes.matched_issues.length > 0) {
          setSimilarMatches(simRes.matched_issues);
          if (simRes.suggested_action === 'link_existing') {
            setIsSimilarModalOpen(true);
          }
        }
      }
    } catch (err: any) {
      console.warn('AI analysis error, fallback triggered:', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Link to Existing Issue
  const handleLinkToExisting = async (issueId: string) => {
    setIsLinking(true);
    const citizenId = user?.id || profile?.id || 'anonymous';

    try {
      const res = await api.linkComplaintToExisting({
        citizen_id: citizenId,
        civic_issue_id: issueId,
        original_text: description,
        normalized_text: analysisResult?.problem_title || description,
        language: inputLang,
        category: analysisResult?.category,
        area,
        landmark,
        duration,
        accident_reported: accidentReported,
        accident_description: accidentDescription,
        auto_support: true,
        evidence_urls: evidenceUrls
      });

      setIsSimilarModalOpen(false);
      setSubmissionResult({
        complaintId: res.complaint_id,
        issueId: issueId,
        issueTitle: analysisResult?.problem_title || t.step1Placeholder,
        status: 'reported',
        wasLinked: true
      });
      success(t.successTitle, t.successSubtitle);
    } catch (err: any) {
      error(t.rejectionTitle, err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Submit as New Consolidated Issue
  const handleSubmitNewIssue = async () => {
    setIsSubmitting(true);
    const citizenId = user?.id || profile?.id || 'anonymous';

    try {
      const res = await api.createIssueWithComplaint({
        citizen_id: citizenId,
        original_text: description,
        normalized_text: analysisResult?.problem_title || description,
        language: inputLang,
        category: analysisResult?.category || 'Roads & Footpaths',
        area,
        landmark,
        duration,
        accident_reported: accidentReported,
        accident_description: accidentDescription,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        priority_score: analysisResult?.severity_score || (accidentReported ? 4 : 2),
        priority_level: (analysisResult?.suggested_priority as any) || (accidentReported ? 'high' : 'medium'),
        evidence_urls: evidenceUrls
      });

      setSubmissionResult({
        complaintId: res.complaint_id,
        issueId: res.issue_id,
        issueTitle: res.title,
        status: res.status,
        wasLinked: false
      });
      success(t.successTitle, t.successSubtitle);
    } catch (err: any) {
      error(t.rejectionTitle, err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted successfully, render success view
  if (submissionResult) {
    return (
      <div className="container container-narrow" style={{ paddingTop: '2.5rem' }}>
        <SubmissionSuccess
          complaintId={submissionResult.complaintId}
          issueId={submissionResult.issueId}
          issueTitle={submissionResult.issueTitle}
          status={submissionResult.status}
          wasLinkedToExisting={submissionResult.wasLinked}
        />
      </div>
    );
  }

  const isRejected = currentStep === 4 && analysisResult?.is_civic_issue === false;

  return (
    <div className="container container-narrow" style={{ paddingTop: '2rem' }}>
      {/* Wizard Progress Stepper */}
      <ProgressBar
        currentStep={currentStep}
        steps={WIZARD_STEPS}
        onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step);
        }}
      />

      {/* Main Wizard Form Card with 3D Depth */}
      <Card style={{ padding: '2rem' }}>
        {currentStep === 1 && (
          <Step1Describe
            description={description}
            onChangeDescription={setDescription}
            language={inputLang}
            onChangeLanguage={setInputLang}
            error={fieldErrors.description}
          />
        )}

        {currentStep === 2 && (
          <Step2Location
            area={area}
            onChangeArea={setArea}
            landmark={landmark}
            onChangeLandmark={setLandmark}
            address={address}
            onChangeAddress={setAddress}
            latitude={latitude}
            longitude={longitude}
            onSetCoordinates={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
            errors={fieldErrors}
          />
        )}

        {currentStep === 3 && (
          <Step3Evidence
            userId={user?.id || profile?.id || 'anonymous'}
            evidenceUrls={evidenceUrls}
            onEvidenceChanged={setEvidenceUrls}
            duration={duration}
            onChangeDuration={setDuration}
            accidentReported={accidentReported}
            onChangeAccidentReported={setAccidentReported}
            accidentDescription={accidentDescription}
            onChangeAccidentDescription={setAccidentDescription}
          />
        )}

        {currentStep === 4 && (
          <Step4AIReview
            isAnalyzing={isAnalyzing}
            analysis={analysisResult}
            onUpdateAnalysis={setAnalysisResult}
            onOpenSimilarModal={() => setIsSimilarModalOpen(true)}
            similarCount={similarMatches.length}
            onEditDescription={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 5 && analysisResult && (
          <Step5FinalReview
            originalText={description}
            analysis={analysisResult}
            area={area}
            landmark={landmark}
            duration={duration}
            accidentReported={accidentReported}
            accidentDescription={accidentDescription}
            evidenceUrls={evidenceUrls}
          />
        )}

        {/* Wizard Controls Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              leftIcon={<ArrowLeft size={16} />}
              onClick={handleBack}
              disabled={isAnalyzing || isSubmitting}
            >
              {t.backButton}
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            !isRejected && (
              <Button
                type="button"
                variant="cyan"
                rightIcon={<ArrowRight size={16} />}
                onClick={handleNext}
                isLoading={isAnalyzing}
              >
                {currentStep === 3 ? t.analyzeAIButton : t.continueButton}
              </Button>
            )
          ) : (
            <Button
              type="button"
              variant="cyan"
              size="lg"
              leftIcon={<Send size={18} />}
              onClick={handleSubmitNewIssue}
              isLoading={isSubmitting}
            >
              {t.submitReport}
            </Button>
          )}
        </div>
      </Card>

      {/* Deduplication Modal */}
      <SimilarIssuesModal
        isOpen={isSimilarModalOpen}
        onClose={() => setIsSimilarModalOpen(false)}
        matches={similarMatches}
        onSelectExistingIssue={handleLinkToExisting}
        onProceedAsNew={() => {
          setIsSimilarModalOpen(false);
          setCurrentStep(5);
        }}
        isLinking={isLinking}
      />
    </div>
  );
};
