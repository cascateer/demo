import {
  ApiProvider,
  createSlice,
  defineCustomProperties,
} from "@cascateer/core";
import axios from "axios";
import { combineLatest, from, map } from "rxjs";
import { CubeComponent } from "./Cube/component";
import { CubeActionsComponent } from "./CubeActions/component";
import { CubeControlsComponent } from "./CubeControls/component";
import { div } from "./operators";
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
      customMoves: effect<void, Cube.Move[]>(() => ({
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
