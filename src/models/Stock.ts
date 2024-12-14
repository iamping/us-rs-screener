export interface Stock {
  key: number
  ticker: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  marketCap: number
  close: number
  avgVolume: number
  avgDollarVolume: number
  fiftyDayAvg: number
  twoHundredDayAvg: number
  rsScore: number
  rsScore3M: number
  rsScore6M: number
  rsScore1Y: number
  rsRating: number
  rsRating3M: number
  rsRating6M: number
  rsRating1Y: number
  sectorRank: number
  industryRank: number
}