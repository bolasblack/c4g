import { Rule, Tree, callRule } from '@angular-devkit/schematics'
import { Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { ensureObservable } from '../helpers/ensureObservable'

export type TreePredicate = (tree: Tree) => boolean | Observable<boolean>

export function when(predicate: TreePredicate, rule: Rule): Rule {
  return (tree, ctx) => {
    return ensureObservable(predicate(tree)).pipe(
      mergeMap((available) =>
        available ? callRule(rule, tree, ctx) : of(tree),
      ),
    )
  }
}
