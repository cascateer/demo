import {
  Action,
  ApiEffect,
  createComponent,
  TerminalEffect,
} from "@cascateer/core";
import { map } from "rxjs";
import { Cube } from "../types";

export const CubeControlsComponent = createComponent("cubeControls")
  .withStyles(import("./styles.module.scss"))
  .withTemplate<
    {
      baseMoves: TerminalEffect<void, Cube.BaseMoves>;
      customMoves: TerminalEffect<void, Cube.Move[]>;
      queueAction: Action<Cube.ActionConfig, void>;
      test: ApiEffect<void, number>;
    },
    {}
  >((deps, classNames) => () => {
    const CubeControl = ({ move: { key, action } }: { move: Cube.Move }) => (
      <button
        type="button"
        className={classNames.cubeControl}
        onClick={() => deps.queueAction(action)}
      >
        {key}
      </button>
    );

    return (
      <>
        <div>
          {deps
            .test()
            .loading.pipe(map((loading) => (loading ? "loading" : "done")))}
        </div>
        <div
          className={classNames.cubeControls}
          data-loading={deps.baseMoves().loading}
        >
          {deps.baseMoves().pipe(
            map((baseMoves) =>
              Object.values(baseMoves)
                .flat()
                .map((baseMove) => <CubeControl move={baseMove} />),
            ),
          )}
        </div>
        <div
          className={classNames.cubeControls}
          data-loading={deps.customMoves().loading}
        >
          {deps
            .customMoves()
            .pipe(
              map((customMoves) =>
                customMoves.map((customMove) => (
                  <CubeControl move={customMove} />
                )),
              ),
            )}
        </div>
      </>
    );
  });
