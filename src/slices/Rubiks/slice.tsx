import {
  ApiProvider,
  createSlice,
  defineCustomProperties,
} from "@cascateer/core";
import axios from "axios";
import { from } from "rxjs";
import { CubeComponent } from "./Cube/component";
import { CubeActionsComponent } from "./CubeActions/component";
import { CubeControlsComponent } from "./CubeControls/component";
import { Cube } from "./types";

const BASE_URL = "https://server-jp2n.onrender.com/rubiks";

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
      baseMoves: effect<void, Cube.BaseMoves>((axios) => ({
        predicate: () => from(axios.get(`${BASE_URL}/baseMoves`)),
        tags: "baseMoves",
      })),
      customMoves: effect<void, Cube.Move[]>((axios) => ({
        predicate: () => from(axios.get(`${BASE_URL}/customMoves`)),
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
      }))
      .complete(),
  components: ({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Cube: component(
          ({ store }) =>
            new CubeComponent({
              baseActionQueue: store.effects.baseActionQueue,
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
