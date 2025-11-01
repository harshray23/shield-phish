export type SslDetails = {
  valid: boolean;
  error?: string;
  subject?: any;
  issuer?: any;
  valid_from?: string;
  valid_to?: string;
};

export type AnalysisResult = {
  url: string;
  ssl: SslDetails;
  htmlSummary: string;
  suggestions: string;
  riskScore: number;
  createdAt: string;
};

export type AnalysisState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: AnalysisResult | null;
  error: string | null;
};

export type AnalysisHistoryItem = {
  id: string;
  url: string;
  riskScore: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export type UserProfile = {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};
