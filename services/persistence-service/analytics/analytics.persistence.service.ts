import { AnalyticsModel } from "./schemas/modules.export";
import type { AnalyticsDetails } from "./schemas/modules.export";
import type { CreateAnalyticsRequestData } from "../../dto-service/modules.export";

export const createAnalyticsEntry = async (data: CreateAnalyticsRequestData): Promise<AnalyticsDetails> => {
  const analytics = new AnalyticsModel(data);
  return await analytics.save();
};

export const getAnalyticsByQRCode = async (qrCodeId: string): Promise<AnalyticsDetails[]> => {
  return await AnalyticsModel.find({ qrCodeId }).sort({ createdAt: -1 });
};

export const getAnalyticsStats = async (qrCodeId: string) => {
  const total = await AnalyticsModel.countDocuments({ qrCodeId });
  
  const uniqueIPs = await AnalyticsModel.distinct("ip", { qrCodeId });
  
  const lastScanned = await AnalyticsModel.findOne({ qrCodeId }).sort({ createdAt: -1 });
  
  const topCities = await AnalyticsModel.aggregate([
    { $match: { qrCodeId } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { city: "$_id", count: 1, _id: 0 } },
  ]);

  const topUserAgents = await AnalyticsModel.aggregate([
    { $match: { qrCodeId } },
    { $group: { _id: "$userAgent", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { userAgent: "$_id", count: 1, _id: 0 } },
  ]);

  return {
    qrCodeId,
    totalScans: total,
    uniqueIPs: uniqueIPs.length,
    lastScanned: lastScanned?.createdAt || new Date(),
    topCities,
    topUserAgents,
  };
};

export const deleteAnalyticsByQRCode = async (qrCodeId: string) => {
  return await AnalyticsModel.deleteMany({ qrCodeId });
};
