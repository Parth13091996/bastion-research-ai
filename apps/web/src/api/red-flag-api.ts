import axiosInstance from '@/api/axios'
import { endpoints } from '@/api/endpoints'

export const redFlagApi = {
  getCompanies: async () => {
    const res = await axiosInstance.get<RedFlagCompany[]>(
      endpoints.redFlags.companies
    )
    return res.data
  },
  createCompany: async (payload: {
    name: string
    logo_url?: string | null
  }) => {
    const res = await axiosInstance.post<RedFlagCompany>(
      endpoints.redFlags.companies,
      payload
    )
    return res.data
  },
  submitDecision: async (payload: {
    companyId: string
    flaggedKeys: string[]
  }) => {
    const res = await axiosInstance.post(
      endpoints.redFlags.submissions,
      payload
    )
    return res.data
  },
  getCompanyStats: async (companyId: string) => {
    const res = await axiosInstance.get<RedFlagCompanyStats>(
      endpoints.redFlags.companyStats(companyId)
    )
    return res.data
  },
  admin: {
    getCompanies: async () => {
      const res = await axiosInstance.get<RedFlagCompany[]>(
        endpoints.redFlags.admin.companies
      )
      return res.data
    },
    createCompany: async (payload: {
      name: string
      logo_url?: string | null
    }) => {
      const res = await axiosInstance.post<RedFlagCompany>(
        endpoints.redFlags.admin.companies,
        payload
      )
      return res.data
    },
    getStats: async () => {
      const res = await axiosInstance.get<RedFlagCompanyStats[]>(
        endpoints.redFlags.admin.stats
      )
      return res.data
    },
    deleteCompany: async (id: string) => {
      const res = await axiosInstance.delete<{ message: string }>(
        endpoints.redFlags.admin.deleteCompany(id)
      )
      return res.data
    },
    clearCompanyStats: async (id: string) => {
      const res = await axiosInstance.delete<{ message: string }>(
        endpoints.redFlags.admin.clearStats(id)
      )
      return res.data
    },
    updateCompany: async (id: string, payload: { name: string; logo_url?: string | null }) => {
      const res = await axiosInstance.patch<RedFlagCompany>(
        endpoints.redFlags.admin.deleteCompany(id),
        payload
      )
      return res.data
    },
  },
}
