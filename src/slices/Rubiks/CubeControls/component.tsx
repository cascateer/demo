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
      spotifyAuth: Action<void, void>;
      youtubeAuth: Action<void, void>;
      youtubeTest: Action<void, void>;
    },
    {}
  >((ctx, cn) => () => {
    const CubeControl = ({ move: { key, action } }: { move: Cube.Move }) => (
      <button
        type="button"
        className={cn.cubeControl}
        onClick={() => ctx.queueAction(new Cube.Action(action))}
      >
        {key}
      </button>
    );

    return (
      <>
        <button
          className={cn.cubeControl}
          type="button"
          onClick={() => ctx.spotifyAuth()}
        >
          Spotify Auth
        </button>
        <button
          className={cn.cubeControl}
          type="button"
          onClick={() => ctx.youtubeAuth()}
        >
          YouTube Auth
        </button>
        <button
          className={cn.cubeControl}
          type="button"
          onClick={() => ctx.youtubeTest().then(console.log)}
        >
          YouTube Test
        </button>
        <div className={cn.cubeControls} data-loading={ctx.baseMoves().pending}>
          {ctx.baseMoves().pipe(
            map((baseMoves) =>
              Object.values(baseMoves)
                .flat()
                .map((baseMove) => <CubeControl move={baseMove} />),
            ),
          )}
        </div>
        <div
          className={cn.cubeControls}
          data-loading={ctx.customMoves().pending}
        >
          {ctx
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
