import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getReportsData } from '../services/reportService';

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { period, startDate, endDate, monthYear } = req.query;

    const data = await getReportsData(userId, {
      period: period as any,
      startDate: startDate as string,
      endDate: endDate as string,
      monthYear: monthYear as string,
    });

    res.json(data);
  } catch (error: any) {
    console.error('[ReportController] Error generating financial reports:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to generate financial reports',
      error: error.message,
    });
  }
};
