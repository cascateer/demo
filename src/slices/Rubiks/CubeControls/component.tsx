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
  >((model, classNames) => () => {
    const CubeControl = ({ move: { key, action } }: { move: Cube.Move }) => (
      <button
        type="button"
        className={classNames.cubeControl}
        onClick={() => model.queueAction(new Cube.Action(action))}
      >
        {key}
      </button>
    );

    return (
      <>
        <button
          className={classNames.cubeControl}
          type="button"
          onClick={() => model.spotifyAuth()}
        >
          Spotify Auth
        </button>
        <button
          className={classNames.cubeControl}
          type="button"
          onClick={() => model.youtubeAuth()}
        >
          YouTube Auth
        </button>
        <button
          className={classNames.cubeControl}
          type="button"
          onClick={() => model.youtubeTest().then(console.log)}
        >
          YouTube Test
        </button>
        <div
          className={classNames.cubeControls}
          data-loading={model.baseMoves().pending}
        >
          {model.baseMoves().pipe(
            map((baseMoves) =>
              Object.values(baseMoves)
                .flat()
                .map((baseMove) => <CubeControl move={baseMove} />),
            ),
          )}
        </div>
        <div
          className={classNames.cubeControls}
          data-loading={model.customMoves().pending}
        >
          {model
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
