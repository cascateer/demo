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
    const mouseDown = new Subject<MouseEvent>();
    const mouseUp = new Subject<MouseEvent>();
    const mouseMove = new Subject<MouseEvent>();
    const mouseLeave = new Subject<MouseEvent>();

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
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseMove={mouseMove}
        onMouseLeave={mouseLeave}
      >
        <div
          className={classNames.cube}
          style={{
            transform: mouseMove.pipe(
              windowToggle(mouseDown, () => merge(mouseUp, mouseLeave)),
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
                    return [action || "none", parity].join("-");
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
