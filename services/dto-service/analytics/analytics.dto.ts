export interface CreateAnalyticsRequestData {
  qrCodeId: string;
  ip: string;
  userAgent: string;
  city?: string;
}

export interface AnalyticsResponseData {
  _id: string;
  qrCodeId: string;
  ip: string;
  userAgent: string;
  city: string;
  createdAt: Date;
}

export interface AnalyticsStatsData {
  qrCodeId: string;
  totalScans: number;
  uniqueIPs: number;
  lastScanned: Date;
  topCities: Array<{ city: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
}
