<h1 id="toc">TOC</h1>

1. [Basic terms and concepts](#1-basic-terms-and-concepts)
   1. [App and Slices](#1-1-app-and-slices)
   2. [Components](#1-2-components)
   3. [Effects and Actions](#1-3-effects-and-actions)
   4. [StoreEffects and -Actions](#1-4-modeleffects-and-actions)
   5. [ApiEffects and -Actions](#1-5-ApiEffects-and-actions)
   6. [TerminalEffects and -Actions](#1-6-terminaleffects-and-actions)

<h2 id="1-basic-terms-and-concepts">1. Basic terms and concepts <a href="#toc">↑</a></h2>

<h2 id="1-1-app-and-slices">1.1 App and Slices <a href="#toc">↑</a></h2>

We begin with an hierarchical overview of the major parts that constitute an **App**.

An App consists of one or more **Slices**. A Slice is created from a **SliceConfig** that consists of four main parts. As they build upon each other, they need to be defined in a consecutive fashion:

1. Store = S
2. Api = A
3. Terminal = T = T(S, A)
4. Components = C = C(T)

<h2 id="1-2-components">1.2 Components <a href="#toc">↑</a></h2>

Store, Api and Terminal are optional, so we may begin from the bottom: **Components** basically is the Slice's collection of **JSX Components**. Before we go into detail, let's just take a look at how a minimal Slice with one single (static) Component would be built:

```tsx
const CounterComponent = createComponent("counter").withTemplate<
  {},
  { value: number }
>(
  () =>
    ({ value }) =>
      `Counter: ${value}`,
);

const ExampleSlice1 = createSlice({
  components: ({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Counter: component(() => new CounterComponent({})),
      }))
      .complete(),
  render: ({ Counter }) => <Counter value={0} />,
});
```

From this Slice we can already build our first App:

```tsx
new App({
    slices: ({ SlicesProvider }) =>
        new SlicesProvider()
            .provideSlices(({ slice }) => ({
                Example1: slice(() => ExampleSlice1),
            }))
            .complete(),
    render: ({ Example1 }) => <Example1 />,
    root: document.body,
);
```

For now, the important bit is

```tsx
() =>
  ({ value }) =>
    `Counter: ${value}`;
```

which in general is a predicate

```tsx
<
    Context extends Dictionary<Effect<any, any> | Action<any, any>>,
    Props extends JSX.Props
>(context: Context): JSX.Component<Props>
```

Any Component is built from two data sources, 1) a dynamic **Context**, and 2) static **(JSX) Props**.

Props build a kind of secondary means for (static) configuration, like setting up the counter seed in our example.

The Context basically is the Component's source of any kind of mutable, global data[^1]. In order to understand what it is and how it works, we first need to look at

[^1]: As is going to be specified more clearly later.

<h2 id="1-3-effects-and-actions">1.3 Effects and Actions <a href="#toc">↑</a></h2>

In technical terms, an **Effect** is simply an (unary) **Observable**-constructor, an **Action** a **Promise**-constructor, so both are of the form

```ts
<A, R>(args: A): ObservableLike<R>
```

In mathematical terms, we can think of this as of families (or parametrizations) of **ObservableLikes**.

In more practical terms, as we've already seen, Effects and Actions make up a Component's Context. So let's try and and bring our `CounterComponent` to life, by removing the static Props and adding a dynamic data source instead:

```tsx
const CounterComponent = createComponent("counter").withTemplate<
  {
    counter: Effect<void, number>;
    incrementCounter: Action<number, void>;
  },
  {}
>(({ counter, incrementCounter }) => () => (
  <button onClick={() => incrementCounter(1)}>{counter()} + 1</button>
));
```

The `counter` Effect builds a kind of parametrised, reactive data stream. The `incrementCounter` Action serves as a trigger to update the underlying data.

The reason for the Action to produce a Promise rather than an Observable is the _hot_ nature of Actions (and Promises). Effect results are just subscribable streams; only upon **Subscription** will `counter()` start emitting, it is _cold_. Calling `incrementCounter` will invoke the Action immediately, and only once. Once the Action is completed, the returned Promise is resolved; the Promise result corresponds to the possible Action result (`void` in our example).

If we look closer at our example, the `incrementCounter` parameter serves as a kind of Action payload (the counter increment); equally could we supply a parameter to our Effect, for example by configuring a counter unit. Of course, there would be nothing wrong with writing

```tsx
counter().pipe(map((value) => `${value}units`));
```

But we need to setup `counter` anyway; and the more generic an Effect or Action is, the more will the effort pay off, once our Components get numerous and heavy.

The three remaining parts of our SliceConfig do in fact serve one objective only: To provide the collection of tailored, ready-made Effects and Actions we will be needing inside our Components, in order to 1) provide a necessary Context, and 2) keep the view template clean of any kind of exhaustive data logic: the view being just the tip of the (data) iceberg. Effects and Actions are supposed to appear as _terminal_ nodes, as far as possible.

<h2 id="1-4-modeleffects-and-actions">1.4 StoreEffects and -Actions <a href="#toc">↑</a></h2>

Our example already suggests the following relationship of Effects and Actions, taken from a standard dictionary:

> An effect refers to a change, consequence, or result produced by an action or cause.

Later, all kind of data that are

1. temporary and owned by the App (_local_)
2. mutable and not managed locally by a Component (_global_)[^2]

[^2]: There may be exceptions from this rule.

will be put inside a **Store**, our App's memory and state manager. The Store provides the sole interface for accessing those data, by reading (Effect) and writing (Action).

Querying data from the Store is done using a special kind of Observable, a **Signal**, forming a **StoreEffect**. Every Signal represents a kind of bi-directional channel to a node of our data tree.

Such a Signal can also induce a state transition, by emitting a special kind of **TransformAction**; and in fact the Store state is comprised exactly of 1) an initial **SeedAction**, and 2) an ordered sequence of TransformActions.

<h2 id="1-5-ApiEffects-and-actions">1.5 ApiEffects and -Actions <a href="#toc">↑</a></h2>

Store and **Api** are (strictly) complementary in the sense that while the Store provides access to internal app data, the Api is the designated external interface of our app. In fact, similar to the Store, the Api is a collection of a special kind of **(Api)Effects and -Actions**, stemming from **Memoizable**- and **Interceptable**-constructors, respectively. Store and Api are disjoint: Their respective Effects and Actions are independent of each other.

For another example, let's try to move our counter from the Store to the Api. Assume we have 1) a GET endpoint returning the counter's current state given an id:

```ts
interface Counter {
  id: string;
  value: number;
}

interface GetCounterRequest {
  params: {
    id: string;
  };
}

interface GetCounterResponse extends Counter {}

const getCounterConfig: MemoizableConfig<
  GetCounterRequest,
  GetCounterResponse
> = {
  predicate: ({ params }: GetCounterRequest): Observable<GetCounterResponse> =>
    defer(() =>
      fetch(GET_COUNTER_URL(params), { method: "GET" }).then((res) =>
        res.json(),
      ),
    ),
  tags: (req: GetCounterRequest, res: GetCounterResponse) => [
    "counter",
    res.id,
  ],
};
```

The resulting Effect

```ts
(req: GetCounterRequest) => Observable<GetCounterResponse>;
```

is being memoized in `req`, by memoizing the Memoizable predicate in `req` and multicasting the result.

And 2) we have a PATCH endpoint to update the counter's value:

```ts
interface PatchCounterRequest {
  params: {
    id: string;
  };
  body: {
    value: number;
  };
}

type PatchCounterResponse = void;

const patchCounterConfig: InterceptableConfig<
  PatchCounterRequest,
  PatchCounterResponse
> = {
  predicate: ({
    params,
    body,
  }: PatchCounterRequest): Promise<PatchCounterResponse> =>
    fetch(PATCH_COUNTER_URL(params, body), { method: "PATCH" }).then((res) =>
      res.json(),
    ),
  tags: (req: PatchCounterRequest, res: PatchCounterResponse) => [
    "counter",
    req.params.id,
  ],
};
```

Note how the Interceptable predicate is hot, as it is corresponding to an Action; whereas Memoizables predicates, like Effects, are cold. Our template now could look like this:

```tsx
const Counter: JSX.Component = (props) => (
    <button onClick={() => patchCounter({ params: { id: "A" }, body: { value: 0 } })}>
        {getCounter({ params: { id: "A" } })} -> 0
    </button>
);
```

When a counter with a given id has been patched, its corresponding tags ``["counter", `${id}`]`` are going to be invalidated, causing re-evaluation of all ApiEffects bearing one of these tags.

The `counter` Effect is reactive: If our endpoints are wired up correctly, we do not have to manually (re)trigger a `getCounter`. A `patchCounter` is triggered manually, but only indirectly through an Action.

But readability of our template could still be improved; and what if our PATCH value is not statically known? At the moment the counter can only be reset to 0. For an actual increment we would need to access the counter's current state. And once we're at it, wouldn't it be nice to have an adjustable increment value? But this value should be part of our Store. How do we make it accessible to our ApiAction, if Store and Api are meant to be disjoint?

<h2 id="1-6-terminaleffects-and-actions">1.6 TerminalEffects and -Actions <a href="#toc">↑</a></h2>

This is where the **Terminal** comes into play. The Terminal is not holding or requesting any additional data, it just combines them. Through standard RxJS operations the **TerminalEffects and -Actions** allow to merge and combine Store- and ApiEffects (as well as chain previously defined TerminalEffects); and it allows to chain Store-, Api- (and Terminal-)Actions, respectively.

This is why it's called a terminal: As we've seen, a Store- or ApiEffect can also directly appear inside a view template, making it a terminus too. But it is often more convenient to have a collection of generic base Store- and ApiEffects and -Actions, and another collection of rather specialised and simplified TerminalEffects and -Actions, to concisely reflect different, view-specific aspects of the raw Effects and Actions.

The Store data we may be able to arrange in a way that does suite our templates' needs (although it partially may already be designed towards the shape of our Api). The Api on the other hand will quite often be automatically generated, from an OpenAPI spec, say. So let's think of the Api of something that is mostly out of our control, but at the same time might be shared across multiple Slices. This is when surely the Terminal could prove quite useful.

Without talking about how to actually build the corresponding Effects- and Actions, let's have a look at our improved counter:

```tsx
const Counter: JSX.Component = (props) => (
  <>
    <input
      value={counterIncrementA()}
      onInput={(event) => updateCounterIncrementA(event.value)}
    />
    <button onClick={() => incrementCounterA()}>
      {counterA()} + {counterIncrementA()}
    </button>
  </>
);
```
