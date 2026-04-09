import {
  ApiProvider,
  createSlice,
  defineCustomProperties,
} from "@cascateer/core";
import axios from "axios";
import { combineLatest, map } from "rxjs";
import { CubeComponent } from "./Cube/component";
import { CubeActionsComponent } from "./CubeActions/component";
import { CubeControlsComponent } from "./CubeControls/component";
import { div } from "./operators";
import { Cube } from "./types";

defineCustomProperties({
  "--cubie-coord-0": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
  "--cubie-coord-1": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
  "--cubie-coord-2": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
});

declare global {
  namespace JSX {
    interface CSSCustomPropertyDefinitions {
      "--cubie-coord-0": JSX.CSSCustomIntegerPropertyDefinition;
      "--cubie-coord-1": JSX.CSSCustomIntegerPropertyDefinition;
      "--cubie-coord-2": JSX.CSSCustomIntegerPropertyDefinition;
    }
  }
}

export const rubiksSlice = createSlice({
  data: {
    baseActionQueue: new Array<Cube.BaseAction>(),
    cubieSliceActionCount: 0,
  },
  store: ({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        baseActionQueue: signal(({ data }) => data.property("baseActionQueue")),
        cubieSliceActionCount: signal(({ data }) =>
          data.property("cubieSliceActionCount"),
        ),
      }))
      .provideActions(({ action }) => ({
        queueAction: action<Cube.ActionConfig>(({ baseActionQueue }) =>
          baseActionQueue.update(
            (action) => (baseActionQueue) =>
              baseActionQueue.concat(new Cube.Action(action).split()),
          ),
        ),
        countCubieSliceAction: action<void>(({ cubieSliceActionCount }) =>
          cubieSliceActionCount.update(
            () => (cubieSliceActionCount) => cubieSliceActionCount + 1,
            { sameOrigin: true },
          ),
        ),
      }))
      .complete(),
  api: new ApiProvider(axios)
    .provideEffects(({ effect }) => ({
      baseMoves: effect<void, Cube.BaseMoves>(() => ({
        predicate: () => ({
          data: {
            Z: [
              { key: "B", action: [{ slice: "B" }] },
              { key: "Bi", action: [{ slice: "B", degree: -1 }] },
              { key: "B2", action: [{ slice: "B", degree: 2 }] },
              {
                key: "Bw",
                action: [{ slice: "B" }, { slice: "S", degree: -1 }],
              },
              { key: "F", action: [{ slice: "F" }] },
              { key: "Fi", action: [{ slice: "F", degree: -1 }] },
              { key: "F2", action: [{ slice: "F", degree: 2 }] },
              { key: "Fw", action: [{ slice: "F" }, { slice: "S" }] },
              { key: "S", action: [{ slice: "S" }] },
              { key: "Si", action: [{ slice: "S", degree: -1 }] },
              { key: "S2", action: [{ slice: "S", degree: 2 }] },
              {
                key: "z",
                action: [
                  { slice: "B", degree: -1 },
                  { slice: "S" },
                  { slice: "F" },
                ],
              },
            ],
            Y: [
              { key: "U", action: [{ slice: "U" }] },
              { key: "Ui", action: [{ slice: "U", degree: -1 }] },
              { key: "U2", action: [{ slice: "U", degree: 2 }] },
              { key: "D", action: [{ slice: "D" }] },
              { key: "Di", action: [{ slice: "D", degree: -1 }] },
              { key: "D2", action: [{ slice: "D", degree: 2 }] },
              { key: "E", action: [{ slice: "E" }] },
              { key: "Ei", action: [{ slice: "E", degree: -1 }] },
              { key: "E2", action: [{ slice: "E", degree: 2 }] },
              {
                key: "Uw",
                action: [{ slice: "U" }, { slice: "E", degree: -1 }],
              },
              { key: "Dw", action: [{ slice: "D" }, { slice: "E" }] },
              {
                key: "y",
                action: [
                  { slice: "D", degree: -1 },
                  { slice: "E", degree: -1 },
                  { slice: "U" },
                ],
              },
            ],
            X: [
              { key: "L", action: [{ slice: "L" }] },
              { key: "Li", action: [{ slice: "L", degree: -1 }] },
              { key: "L2", action: [{ slice: "L", degree: 2 }] },
              { key: "R", action: [{ slice: "R" }] },
              { key: "Ri", action: [{ slice: "R", degree: -1 }] },
              { key: "R2", action: [{ slice: "R", degree: 2 }] },
              {
                key: "x",
                action: [
                  { slice: "L", degree: -1 },
                  { slice: "M", degree: -1 },
                  { slice: "R" },
                ],
              },
              { key: "Lw", action: [{ slice: "L" }, { slice: "M" }] },
              {
                key: "Rw",
                action: [{ slice: "R" }, { slice: "M", degree: -1 }],
              },
              { key: "M", action: [{ slice: "M" }] },
              { key: "Mi", action: [{ slice: "M", degree: -1 }] },
              { key: "M2", action: [{ slice: "M", degree: 2 }] },
            ],
          },
        }),
        tags: "baseMoves",
      })),
      customMoves: effect<void, Cube.Move[]>(() => ({
        predicate: () => ({
          data: [
            {
              key: "Sexy Move",
              action: [
                { slice: "U" },
                { slice: "R" },
                { slice: "U", degree: -1 },
                { slice: "R", degree: -1 },
              ],
            },
          ],
        }),
        tags: "customMoves",
      })),
    }))
    .complete(),
  terminal: ({ TerminalProvider }) =>
    new TerminalProvider()
      .provideEffects(({ effect }) => ({
        baseMoves: effect<void, Cube.BaseMoves>(
          ({ api }) =>
            () =>
              api.effects.baseMoves(),
        ),
        customMoves: effect<void, Cube.Move[]>(
          ({ api }) =>
            () =>
              api.effects.customMoves(),
        ),
        currentBaseActionIndex: effect<void, number>(
          ({ store }) =>
            () =>
              store.effects.cubieSliceActionCount().pipe(div(27)),
        ),
      }))
      .provideEffects(({ effect }) => ({
        currentBaseAction: effect<void, Cube.BaseAction | undefined>(
          ({ store, terminal }) =>
            () =>
              combineLatest([
                store.effects.baseActionQueue(),
                terminal.effects.currentBaseActionIndex(),
              ]).pipe(
                map(
                  ([baseActionQueue, currentBaseActionIndex]) =>
                    baseActionQueue[currentBaseActionIndex],
                ),
              ),
        ),
        currentSliceActions: effect<void, Cube.SliceAction[]>(
          ({ store, terminal }) =>
            () =>
              combineLatest([
                store.effects.baseActionQueue(),
                terminal.effects.currentBaseActionIndex(),
              ]).pipe(
                map(([baseActionQueue, currentBaseActionIndex]) =>
                  baseActionQueue.slice(0, currentBaseActionIndex).flat(),
                ),
              ),
        ),
      }))
      .provideEffects(({ effect }) => ({
        layout: effect<void, Cube.Layout>(
          ({ terminal }) =>
            () =>
              terminal.effects
                .currentSliceActions()
                .pipe(
                  map((currentSliceActions) =>
                    new Cube.Layout().apply(...currentSliceActions),
                  ),
                ),
        ),
      }))
      .complete(),
  components: ({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Cube: component(
          ({ store, terminal }) =>
            new CubeComponent({
              currentBaseAction: terminal.effects.currentBaseAction,
              countCubieSliceAction: store.actions.countCubieSliceAction,
              layout: terminal.effects.layout,
            }),
        ),
        CubeActions: component(
          ({ store }) =>
            new CubeActionsComponent({
              baseActionQueue: store.effects.baseActionQueue,
            }),
        ),
        CubeControls: component(
          ({ store, terminal }) =>
            new CubeControlsComponent({
              baseMoves: terminal.effects.baseMoves,
              customMoves: terminal.effects.customMoves,
              queueAction: store.actions.queueAction,
            }),
        ),
      }))
      .complete(),
  render: ({ Cube, CubeActions, CubeControls }) => (
    <>
      <Cube />
      <CubeActions />
      <CubeControls />
    </>
  ),
});
