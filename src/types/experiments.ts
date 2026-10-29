/**
 * Experiment Types for Clipper A/B Testing
 * 
 * Type definitions aligned with the experiment service and Prisma schema.
 * Used throughout the Clipper web SaaS application.
 */

// Experiment Strategy Types
export type ExperimentStrategy = 
  | 'percentage'
  | 'user_list'
  | 'feature_flag';

// Experiment Metric Types
export type ExperimentMetric = 
  | 'clip_created'
  | 'subtitle_edited'
  | 'title_generated'
  | 'description_generated'
  | 'hashtag_added'
  | 'render_completed'
  | 'credits_consumed'
  | 'subscription_upgrade'
  | 'churn_prevention';

// Experiment Status Types
export type ExperimentStatus = 
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'archived';

// Experiment Variant Assignment
export type ExperimentVariant = 'A' | 'B';

// Experiment Configuration (for admin panel forms)
export interface ExperimentConfig {
  key: string;
  name: string;
  description?: string;
  strategy: ExperimentStrategy;
  percentage?: number; // 0-100, required for percentage strategy
  userIds?: string[];  // required for user_list strategy
  metric: string;      // primary success metric
  variantA: string;    // e.g., "prompt_v3"
  variantB: string;    // e.g., "prompt_v4"
  startDate?: Date;    // optional start date
  endDate?: Date;      // optional end date
}

// Experiment Assignment (user-level)
export interface ExperimentAssignment {
  experimentKey: string;
  userId: string;
  variant: ExperimentVariant;
  assignedAt: Date;
  converted: boolean;
}

// Experiment Statistics (server-side)
export interface ExperimentStats {
  sampleSize: number;
  conversionRate: number;
  variantACount: number;
  variantBCount: number;
  metric: string;
  status: ExperimentStatus;
}

// Experiment Results (after completion)
export interface ExperimentResults {
  winner: 'A' | 'B' | 'none' | 'inconclusive';
  sampleSizeA: number;
  sampleSizeB: number;
  conversionRateA: number;
  conversionRateB: number;
  difference: number;
  significant: boolean;
  recommendation: string;
}

// User's active experiments
export interface UserExperimentAssignments {
  [experimentKey: string]: ExperimentVariant;
}

// Validation result for experiment config
export interface ExperimentValidation {
  valid: boolean;
  errors: string[];
}

// Experiment comparison data for UI
export interface ExperimentComparison {
  key: string;
  name: string;
  status: ExperimentStatus;
  sampleSize: number;
  conversionRate: number;
  variantACount: number;
  variantBCount: number;
  daysRunning?: number;
}

// Statistical test parameters
export interface StatisticalTestParams {
  minimumSampleSize: number; // default: 100
  minimumConversionRateDiff: number; // default: 0.05 (5%)
}

// API response types
export interface ApiExperimentCreate {
  success: boolean;
  experiment: {
    id: string;
    key: string;
    name: string;
    status: ExperimentStatus;
  };
  message?: string;
}

export interface ApiExperimentAssign {
  success: boolean;
  variant: ExperimentVariant;
  message?: string;
}

export interface ApiExperimentStats {
  success: boolean;
  experimentKey: string;
  stats: ExperimentStats;
  message?: string;
}

export interface ApiExperimentComplete {
  success: boolean;
  results: ExperimentResults;
  message?: string;
}