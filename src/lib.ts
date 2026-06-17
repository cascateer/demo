import { flatMap } from "@cascateer/lib/operators";
import { fromEvent, Observable } from "rxjs";

export const eventListener = <
  T extends Node,
  K extends keyof HTMLElementEventMap,
>(
  target: T,
  type: K,
): Observable<{ type: K; target: T }> =>
  fromEvent(target, type).pipe(
    flatMap((event) => {
      const { currentTarget } = event;

      if (currentTarget instanceof Node && target.isEqualNode(currentTarget)) {
        return {
          type,
          target,
        };
      }

      return [];
    }),
  );
