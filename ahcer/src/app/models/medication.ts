export interface Medication {
  name: string,
  type: string,
  doseInfo: {
    amount: number,
    unit: string
  },
  id: string,
  active?: boolean
}
