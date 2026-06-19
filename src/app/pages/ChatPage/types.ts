interface IOpenFilters {
  message: boolean,
  time: boolean
}

interface ICheckedFilters {
  message: string[],
  time: string[]
}

interface IOptionsFilter {
  value: string,
  label: string
}

export type {
  IOpenFilters, ICheckedFilters, IOptionsFilter
}