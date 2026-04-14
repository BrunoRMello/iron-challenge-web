export interface EventCategory {
  categoryId: string
  name: string
  weightRequirement: number
}

export interface EventData {
  _id: string
  name: string
  description: string
  startDate: string
  finishDate: string
  eventDate: string
  categories: EventCategory[]
  createdAt: string
  updatedAt: string
}
