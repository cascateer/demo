import { createComponent, StoreEffect } from "@cascateer/core";
import { combineLatest, map } from "rxjs";
import { Cube } from "../types";

export const CubeActionsComponent = createComponent("cubeActions")
  .withStyles(import("./styles.module.scss"))
  .withTemplate<
    {
      baseActionQueue: StoreEffect<Cube.BaseAction[]>;
      currentBaseActionIndex: StoreEffect<number>;
    },
    {}
  >((ctx, { cubeBaseAction }) => () => (
    <>
      {ctx.baseActionQueue().list((baseAction, index) => (
        <div>
          {combineLatest([baseAction, ctx.currentBaseActionIndex()]).pipe(
            map(([baseAction, currentIndex]) => (
              <div
                className={cubeBaseAction}
                data-playing={index === currentIndex}
              >
                {baseAction.map(({ slice, degree }) => (
                  <>
                    <sub>{slice}</sub>
                    <sup data-value={degree === 1 ? void 0 : degree} />
                  </>
                ))}
              </div>
            )),
          )}
        </div>
      ))}
    </>
  ));
