import { Action, createComponent, TerminalEffect } from "@cascateer/core";
import {
  animationFrameScheduler,
  auditTime,
  merge,
  pairwise,
  Subject,
  switchAll,
  windowToggle,
} from "rxjs";
import { intersectWith, rotate3d, toCubieFaceletColor } from "../operators";
import { Cube } from "../types";

export const CubeComponent = createComponent("cube")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      currentBaseAction: TerminalEffect<void, Cube.BaseAction | undefined>;
      countCubieSliceAction: Action<void, void>;
      layout: TerminalEffect<void, Cube.Layout>;
    },
    {}
  >((deps, classNames) => () => {
    const mouseDown = new Subject<MouseEvent>();
    const mouseUp = new Subject<MouseEvent>();
    const mouseMove = new Subject<MouseEvent>();
    const mouseLeave = new Subject<MouseEvent>();

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
              data-cubie-slice-action={deps
                .currentBaseAction()
                .pipe(intersectWith(cubie))}
              onAnimationEnd={() => deps.countCubieSliceAction()}
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
                      data-color={deps
                        .layout()
                        .pipe(toCubieFaceletColor(cubie, face))}
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
