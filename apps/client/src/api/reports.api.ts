import axiosInstance from './axiosInstance'

export interface CustomReportPayload {
  fromDate: string
  toDate: string
  selectedFields: string[]
  paymentType?: 'all' | 'prepaid' | 'cod'
}

export const downloadCustomReportCsv = async (payload: CustomReportPayload): Promise<Blob> => {
  const response = await axiosInstance.post('/reports/custom-export', payload, {
    responseType: 'blob',
  })
  return response.data
}

