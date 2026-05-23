import { Action, createComponent, TerminalEffect } from "@cascateer/core";
import { map } from "rxjs";
import { Cube } from "../types";

export const CubeControlsComponent = createComponent("cubeControls")
  .withStyles(import("./styles.module.scss"))
  .withTemplate<
    {
      baseMoves: TerminalEffect<void, Cube.BaseMoves>;
      customMoves: TerminalEffect<void, Cube.Move[]>;
      queueAction: Action<Cube.Action, void>;
      youtubeAuth: Action<void, void>;
      youtubeTest: Action<void, void>;
    },
    {}
  >((deps, classNames) => () => {
    const CubeControl = ({ move: { key, action } }: { move: Cube.Move }) => (
      <button
        type="button"
        className={classNames.cubeControl}
        onClick={() => deps.queueAction(new Cube.Action(action))}
      >
        {key}
      </button>
    );

    return (
      <>
        <button type="button" onClick={() => deps.youtubeAuth()}>
          YouTube Auth
        </button>
        <button
          type="button"
          onClick={() => deps.youtubeTest().then(console.log)}
        >
          YouTube Test
        </button>
        <div
          className={classNames.cubeControls}
          data-loading={deps.baseMoves().pending}
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
          data-loading={deps.customMoves().pending}
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
