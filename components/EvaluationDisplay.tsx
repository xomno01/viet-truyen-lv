
import React from 'react';
import { EvaluationResult } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface EvaluationDisplayProps {
  evaluationResult: EvaluationResult | null;
  isLoading: boolean;
  error: string | null;
}

const EvaluationSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h4 className="font-semibold text-[var(--theme-text-accent)] mb-1">{title}</h4>
    <div className="text-sm text-[var(--theme-text-primary)] leading-normal">{children}</div>
  </div>
);

const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ evaluationResult, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <LoadingSpinner />
        <p className="mt-3 text-[var(--theme-text-secondary)]">Đang phân tích tác phẩm...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center py-10">Lỗi đánh giá: {error}</p>;
  }

  if (!evaluationResult) {
    return <p className="text-[var(--theme-text-secondary)] text-center py-10">Chưa có đánh giá nào.</p>;
  }

  return (
    <div className="space-y-5">
      <EvaluationSection title="Điểm số:">
        <p className="text-3xl font-extrabold text-[var(--theme-accent-secondary)]">{evaluationResult.score}/10</p>
      </EvaluationSection>
      <EvaluationSection title="Nhận xét tổng quan:">
        <p>{evaluationResult.overallFeedback}</p>
      </EvaluationSection>
      <EvaluationSection title="Điểm mạnh nổi bật:">
        <p>{evaluationResult.strengths}</p>
      </EvaluationSection>
      <EvaluationSection title="Gợi ý cải thiện:">
        <p>{evaluationResult.areasForImprovement}</p>
      </EvaluationSection>
      {evaluationResult.detailedCritique && Object.keys(evaluationResult.detailedCritique).length > 0 && (
        <EvaluationSection title="Phân tích chi tiết:">
          <pre className="whitespace-pre-wrap bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] p-3 rounded text-xs sm:text-sm max-h-60 overflow-y-auto">
            {Object.entries(evaluationResult.detailedCritique)
              .filter(([, value]) => value) 
              .map(([key, value]) => (
                <React.Fragment key={key}>
                  <strong className="text-[var(--theme-text-primary)]">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {value}\n
                </React.Fragment>
              ))}
          </pre>
        </EvaluationSection>
      )}
    </div>
  );
};

export default EvaluationDisplay;