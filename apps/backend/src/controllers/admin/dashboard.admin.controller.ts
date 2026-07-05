import { Response } from 'express'
import { getAdminDashboardStats } from '../../models/services/adminDashboard.service'

export const getAdminDashboardStatsController = async (req: any, res: Response) => {
  try {
    const stats = await getAdminDashboardStats({
      range: req.query.range,
      courier: req.query.courier,
      paymentType: req.query.paymentType,
    })
    return res.json(stats)
  } catch (error) {
    console.error('[getAdminDashboardStatsController]', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard stats',
    })
  }
}
