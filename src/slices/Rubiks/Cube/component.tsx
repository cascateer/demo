import { createComponent, StoreEffect } from "@cascateer/core";
import {
  animationFrameScheduler,
  auditTime,
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  pairwise,
  scan,
  startWith,
  Subject,
  switchAll,
  windowToggle,
} from "rxjs";
import { div, mod } from "../math";
import { intersectWith, rotate3d, toCubieFaceletColor } from "../operators";
import { Cube } from "../types";

export const CubeComponent = createComponent("cube")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      baseActionQueue: StoreEffect<Cube.BaseAction[]>;
    },
    {}
  >((deps, classNames) => () => {
    const mouseDownOrTouchStart = new Subject<MouseEvent | TouchEvent>();
    const mouseUpOrTouchEnd = new Subject<MouseEvent | TouchEvent>();
    const mouseMoveOrTouchMove = new Subject<MouseEvent | TouchEvent>();
    const mouseLeaveOrTouchCancel = new Subject<MouseEvent | TouchEvent>();

    const cubieSliceAction = new Subject<void>();
    const currentBaseActionIndex = cubieSliceAction.pipe(
      scan((acc) => acc + 1, 0),
      map((count) => div(count, 27)),
      startWith(0),
      distinctUntilChanged(),
    );

    const currentBaseAction = combineLatest([
      deps.baseActionQueue(),
      currentBaseActionIndex,
    ]).pipe(
      map(
        ([baseActionQueue, currentBaseActionIndex]) =>
          baseActionQueue[currentBaseActionIndex],
      ),
    );

    const layout = combineLatest([
      deps.baseActionQueue(),
      currentBaseActionIndex,
    ]).pipe(
      map(([baseActionQueue, currentBaseActionIndex]) =>
        baseActionQueue.slice(0, currentBaseActionIndex).flat(),
      ),
      map((currentSliceActions) =>
        new Cube.Layout().apply(...currentSliceActions),
      ),
    );

    return (
      <div
        className={classNames.cubeSpace}
        onMouseDown={mouseDownOrTouchStart}
        onTouchStart={mouseDownOrTouchStart}
        onMouseUp={mouseUpOrTouchEnd}
        onTouchEnd={mouseUpOrTouchEnd}
        onMouseMove={mouseMoveOrTouchMove}
        onTouchMove={mouseMoveOrTouchMove}
        onMouseLeave={mouseLeaveOrTouchCancel}
        onTouchCancel={mouseLeaveOrTouchCancel}
      >
        <div
          className={classNames.cube}
          style={{
            transform: mouseMoveOrTouchMove.pipe(
              windowToggle(mouseDownOrTouchStart, () =>
                merge(mouseUpOrTouchEnd, mouseLeaveOrTouchCancel),
              ),
              switchAll(),
              pairwise(),
              rotate3d(),
              auditTime(0, animationFrameScheduler),
            ),
          }}
        >
          {Cube.CUBIES.map((cubie) => (
            <div
              className={classNames.cubieSpace}
              data-cubie-slice-action={combineLatest([
                currentBaseAction.pipe(intersectWith(cubie)),
                currentBaseActionIndex.pipe(map((index) => mod(index, 2))),
              ]).pipe(
                map(([action, parity]) => {
                  if (action != null) {
                    return [action || "void", parity].join("_");
                  }
                }),
              )}
              onAnimationEnd={() => cubieSliceAction.next()}
            >
              <div
                className={classNames.cubie}
                style={{
                  "--cubie-coord-0": cubie.coords[0].toString(),
                  "--cubie-coord-1": cubie.coords[1].toString(),
                  "--cubie-coord-2": cubie.coords[2].toString(),
                }}
              >
                {Cube.FACES.map((face) => (
                  <div
                    className={[
                      classNames.cubieFace,
                      classNames[`cubieFace${face}`],
                    ]}
                  >
                    <div
                      className={classNames.cubieFacelet}
                      data-color={layout.pipe(toCubieFaceletColor(cubie, face))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });
