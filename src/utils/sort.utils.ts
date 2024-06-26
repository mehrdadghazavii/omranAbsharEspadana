import moment from "jalali-moment";

export function sortNumbers(array: any[], field:string, state: number) {
  if (state === 2) {
    array.sort((a, b) => a[field] - b[field])
  } else if (state === 1) {
    array.sort((a, b) => b[field] - a[field])
  }
  return array
}

export function sortStrings(array: any[], field:string, state:number){
  if (state === 1) {
    array.sort((a, b) => {
      if (a[field] > b[field])
        return 1
      else return -1
    })
  } else if (state === 2) {
    array.sort((a, b) => {
      if (a[field] > b[field])
        return -1
      else return 1
    })
  }
  return array
}

export function sortDates(array: any[], field:string, state: number){
  if (state === 2) {
    array.sort((a, b) => moment(a[field]).diff(moment( b[field]),'minute') > 0 ? 1: -1)
  } else if (state === 1) {
    array.sort((a, b) => moment(a[field]).diff(moment( b[field]),'minute') > 0 ? -1: 1)
  }
  return array
}