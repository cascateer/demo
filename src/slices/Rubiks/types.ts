import { chunkWith } from "@cascateer/core/lib";
import { at, isNumber } from "lodash";
import { mod, Permutation, Twist } from "./math";

export namespace Cube {
  export type Axis = "X" | "Y" | "Z";

  export type Coord = -1 | 0 | 1;

  export type Coords = [Coord, Coord, Coord];

  export type Face = "L" | "R" | "U" | "D" | "B" | "F";

  export type Slice = Face | "M" | "E" | "S";

  export interface DisjointSlices extends Record<Axis, Slice> {
    X: "L" | "M" | "R";
    Y: "U" | "E" | "D";
    Z: "B" | "S" | "F";
  }

  export const AXES: Axis[] = ["X", "Y", "Z"];
  export const COORDS: Coord[] = [-1, 0, 1];
  export const FACES: Face[] = ["L", "R", "U", "D", "B", "F"];
  export const SLICES: Slice[] = [...FACES, "M", "E", "S"];
  export const DISJOINT_SLICES: { [A in Axis]: DisjointSlices[A][] } = {
    X: ["L", "M", "R"],
    Y: ["U", "E", "D"],
    Z: ["B", "S", "F"],
  };

  export class Cubie {
    constructor(public coords: Coords) {}

    get index() {
      const [x, y, z] = this.coords;

      return 3 * (3 * (x + 1) + (y + 1)) + (z + 1);
    }

    get slices(): DisjointSlices {
      return {
        X: { "-1": "L" as const, 0: "M" as const, "1": "R" as const }[
          this.coords[0]
        ],
        Y: { "-1": "U" as const, 0: "E" as const, "1": "D" as const }[
          this.coords[1]
        ],
        Z: { "-1": "B" as const, 0: "S" as const, "1": "F" as const }[
          this.coords[2]
        ],
      };
    }

    get faces(): Face[] {
      return Object.values(
        at(
          this.slices,
          this.coords[0] * this.coords[1] * this.coords[2] >= 0
            ? ["X", "Y", "Z"]
            : ["X", "Z", "Y"],
        ),
      ).flatMap((slice) => FACES.find((face) => face === slice) ?? []);
    }
  }

  export const CUBIES = [
    ...(function* (range: Coord[]) {
      for (const x of range) {
        for (const y of range) {
          for (const z of range) {
            yield new Cubie([x, y, z]);
          }
        }
      }
    })(COORDS),
  ];

  export interface SliceActionConfig<S extends Slice = Slice> {
    slice: S;
    degree?: number;
  }

  export class SliceAction<S extends Slice = Slice> {
    slice: S;
    degree: number;

    constructor({ slice, degree = 1 }: SliceActionConfig<S>) {
      this.slice = slice;
      this.degree = degree;
    }

    normalize(): SliceAction<S> {
      return SliceAction.fromConfig({
        ...this,
        degree: mod(this.degree, 4),
      });
    }

    toString(): string {
      return [this.slice, this.degree].join("");
    }

    static fromConfig<S extends Slice>(
      config: SliceActionConfig<S>,
    ): SliceAction<S> {
      return new SliceAction(config);
    }
  }

  export interface BaseActionConfig<A extends Axis = Axis> extends Array<
    SliceActionConfig<DisjointSlices[A]>
  > {}

  export class BaseAction<A extends Axis = Axis> extends Array<
    SliceAction<DisjointSlices[A]>
  > {
    constructor(config: BaseActionConfig<A>) {
      super(...config.map(SliceAction.fromConfig));
    }

    get axis(): Axis {
      for (const axis of AXES) {
        if (
          this.every((action) =>
            DISJOINT_SLICES[axis].some((slice) => slice === action.slice),
          )
        ) {
          return axis;
        }
      }

      throw new Error();
    }

    static fromConfig<A extends Axis>(
      config: BaseActionConfig<A>,
    ): BaseAction<A> {
      return new BaseAction(config);
    }
  }

  export interface ActionConfig<S extends Slice = Slice> extends Array<
    SliceActionConfig<S>
  > {}

  export class Action<S extends Slice> extends Array<SliceAction<S>> {
    constructor(config: ActionConfig<S>) {
      super(...config.map(SliceAction.fromConfig));
    }

    split(): BaseAction<Axis>[] {
      return chunkWith(this, (a, b) => {
        try {
          return Boolean(new BaseAction([a, b]).axis);
        } catch {
          return false;
        }
      }).map(BaseAction.fromConfig);
    }

    static fromConfig<S extends Slice>(config: ActionConfig<S>): Action<S> {
      return new Action(config);
    }
  }

  export interface BaseMove<A extends Axis> {
    key: string;
    action: BaseActionConfig<A>;
  }

  export type BaseMoves = { [A in Cube.Axis]: Cube.BaseMove<A>[] };

  export interface Move<S extends Slice = Slice> {
    key: string;
    action: ActionConfig<S>;
  }

  export class Layout {
    permutation: Permutation;
    twist: Twist;

    constructor(
      layout: { permutation: Permutation; twist: Twist } | number = 27,
    ) {
      if (isNumber(layout)) {
        layout = {
          permutation: new Permutation(layout),
          twist: new Twist(layout),
        };
      }

      this.permutation = layout.permutation;
      this.twist = layout.twist;
    }

    multiply({ permutation, twist }: Layout): Layout {
      return new Layout({
        permutation: this.permutation.multiply(permutation),
        twist: new Twist(
          twist.map((y, x) => this.twist.at(permutation.inverseOf(x)) + y),
        ),
      });
    }

    apply(...sliceActions: SliceActionConfig[]): Layout {
      const [action, ...actions] = sliceActions;

      if (action == null) {
        return this;
      }

      if (actions.length > 0) {
        return this.apply(action).apply(...actions);
      }

      const { slice, degree } = SliceAction.fromConfig(action).normalize();

      return degree > 0
        ? this.multiply(
            SLICE_LAYOUTS[slice].apply({
              slice,
              degree: degree - 1,
            }),
          )
        : this;
    }
  }

  export const SLICE_LAYOUTS: Record<Slice, Layout> = {
    L: new Layout({
      permutation: Permutation.fromCyclesString(27, "(0 2 8 6)(1 5 7 3)"),
      twist: new Twist([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0,
      ]),
    }),
    R: new Layout({
      permutation: Permutation.fromCyclesString(
        27,
        "(18 24 26 20)(19 21 25 23)",
      ),
      twist: new Twist([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0,
      ]),
    }),
    U: new Layout({
      permutation: Permutation.fromCyclesString(27, "(0 18 20 2)(1 9 19 11)"),
      twist: new Twist([
        2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0,
        0, 0, 0,
      ]),
    }),
    D: new Layout({
      permutation: Permutation.fromCyclesString(27, "(6 8 26 24)(7 17 25 15)"),
      twist: new Twist([
        0, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
        2, 1, 1,
      ]),
    }),
    B: new Layout({
      permutation: Permutation.fromCyclesString(27, "(0 6 24 18)(3 15 21 9)"),
      twist: new Twist([
        1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0,
        1, 0, 0,
      ]),
    }),
    F: new Layout({
      permutation: Permutation.fromCyclesString(27, "(2 20 26 8)(5 11 23 17)"),
      twist: new Twist([
        0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
        0, 0, 2,
      ]),
    }),
    M: new Layout({
      permutation: Permutation.fromCyclesString(
        27,
        "(11 17 15 9)(14 16 12 10)",
      ),
      twist: new Twist([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0,
      ]),
    }),
    E: new Layout({
      permutation: Permutation.fromCyclesString(27, "(3 5 23 21)(4 14 22 12)"),
      twist: new Twist([
        0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,
        0, 0, 0,
      ]),
    }),
    S: new Layout({
      permutation: Permutation.fromCyclesString(27, "(1 19 25 7)(4 10 22 16)"),
      twist: new Twist([
        0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
        0, 1, 0,
      ]),
    }),
  };
}
