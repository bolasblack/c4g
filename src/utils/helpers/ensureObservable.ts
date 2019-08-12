import { isObservable } from '@angular-devkit/core'
import { Observable, of as of$ } from 'rxjs'

export function ensureObservable<T>(input: T | Observable<T>) {
  return isObservable(input) ? input : of$(input)
}
