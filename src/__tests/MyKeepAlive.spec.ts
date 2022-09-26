import {describe, test, expect, beforeEach, vi} from "vitest";
import {
  h,
  ref,

  // KeepAlive,
  ComponentOptions,
  nextTick,
} from "vue";
import {render, serializeInner, nodeOps, TestElement} from "./runtime-test";

const timeout = (n: number = 0) => new Promise((r) => setTimeout(r, n));

import {KeepAliveProps} from "vue";

import {MyKeepAlive} from "../components/MyKeepAlive";
const KeepAlive = MyKeepAlive;

describe("KeepAlive", () => {
  let one: ComponentOptions;
  let two: ComponentOptions;
  let views: Record<string, ComponentOptions>;
  let root: TestElement;

  beforeEach(() => {
    root = nodeOps.createElement("div");
    one = {
      name: "one",
      data: () => ({msg: "one"}),
      render(this: any) {
        return h("div", this.msg);
      },
      created: vi.fn(),
      mounted: vi.fn(),
      activated: vi.fn(),
      deactivated: vi.fn(),
      unmounted: vi.fn(),
    };
    two = {
      name: "two",
      data: () => ({msg: "two"}),
      render(this: any) {
        return h("div", this.msg);
      },
      created: vi.fn(),
      mounted: vi.fn(),
      activated: vi.fn(),
      deactivated: vi.fn(),
      unmounted: vi.fn(),
    };
    views = {
      one,
      two,
    };
  });

  function assertHookCalls(component: any, callCounts: number[]) {
    expect([
      component.created.mock.calls.length,
      component.mounted.mock.calls.length,
      component.activated.mock.calls.length,
      component.deactivated.mock.calls.length,
      component.unmounted.mock.calls.length,
    ]).toEqual(callCounts);
  }

  test("should preserve state", async () => {
    const viewRef = ref("one");
    const instanceRef = ref<any>(null);
    const App = {
      render() {
        return h(KeepAlive, null, {
          default: () => h(views[viewRef.value], {ref: instanceRef}),
        });
      },
    };

    render(h(App), root);
    expect(serializeInner(root)).toBe(`<div>one</div>`);
    instanceRef.value.msg = "changed";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>changed</div>`);
    viewRef.value = "two";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>two</div>`);
    viewRef.value = "one";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>changed</div>`);
  });

  async function assertNameMatch(props: KeepAliveProps) {
    const outerRef = ref(true);
    const viewRef = ref("one");
    const App = {
      render() {
        return outerRef.value
          ? h(KeepAlive, props, () => h(views[viewRef.value]))
          : null;
      },
    };
    render(h(App), root);

    expect(serializeInner(root)).toBe(`<div>one</div>`);
    assertHookCalls(one, [1, 1, 1, 0, 0]);
    assertHookCalls(two, [0, 0, 0, 0, 0]);

    viewRef.value = "two";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>two</div>`);
    assertHookCalls(one, [1, 1, 1, 1, 0]);
    assertHookCalls(two, [1, 1, 0, 0, 0]);

    viewRef.value = "one";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>one</div>`);
    assertHookCalls(one, [1, 1, 2, 1, 0]);
    assertHookCalls(two, [1, 1, 0, 0, 1]);

    viewRef.value = "two";
    await nextTick();
    expect(serializeInner(root)).toBe(`<div>two</div>`);
    assertHookCalls(one, [1, 1, 2, 2, 0]);
    assertHookCalls(two, [2, 2, 0, 0, 1]);

    // teardown
    outerRef.value = false;
    await nextTick();
    expect(serializeInner(root)).toBe(`<!---->`);
    assertHookCalls(one, [1, 1, 2, 2, 1]);
    assertHookCalls(two, [2, 2, 0, 0, 2]);
  }

  // describe("props", () => {
  //   test("include (string)", async () => {
  //     await assertNameMatch({include: "one"});
  //   });
  // test("include (regex)", async () => {
  //   await assertNameMatch({include: /^one$/});
  // });
  // test("include (array)", async () => {
  //   await assertNameMatch({include: ["one"]});
  // });
  // test("exclude (string)", async () => {
  //   await assertNameMatch({exclude: "two"});
  // });
  // test("exclude (regex)", async () => {
  //   await assertNameMatch({exclude: /^two$/});
  // });
  // test("exclude (array)", async () => {
  //   await assertNameMatch({exclude: ["two"]});
  // });
  // test("include + exclude", async () => {
  //   await assertNameMatch({include: "one,two", exclude: "two"});
  // });
  // test("max", async () => {
  //   const spyAC = vi.fn();
  //   const spyBC = vi.fn();
  //   const spyCC = vi.fn();
  //   const spyAA = vi.fn();
  //   const spyBA = vi.fn();
  //   const spyCA = vi.fn();
  //   const spyADA = vi.fn();
  //   const spyBDA = vi.fn();
  //   const spyCDA = vi.fn();
  //   const spyAUM = vi.fn();
  //   const spyBUM = vi.fn();
  //   const spyCUM = vi.fn();
  //   function assertCount(calls: number[]) {
  //     expect([
  //       spyAC.mock.calls.length,
  //       spyAA.mock.calls.length,
  //       spyADA.mock.calls.length,
  //       spyAUM.mock.calls.length,
  //       spyBC.mock.calls.length,
  //       spyBA.mock.calls.length,
  //       spyBDA.mock.calls.length,
  //       spyBUM.mock.calls.length,
  //       spyCC.mock.calls.length,
  //       spyCA.mock.calls.length,
  //       spyCDA.mock.calls.length,
  //       spyCUM.mock.calls.length,
  //     ]).toEqual(calls);
  //   }
  //   const viewRef = ref("a");
  //   const views: Record<string, ComponentOptions> = {
  //     a: {
  //       render: () => `one`,
  //       created: spyAC,
  //       activated: spyAA,
  //       deactivated: spyADA,
  //       unmounted: spyAUM,
  //     },
  //     b: {
  //       render: () => `two`,
  //       created: spyBC,
  //       activated: spyBA,
  //       deactivated: spyBDA,
  //       unmounted: spyBUM,
  //     },
  //     c: {
  //       render: () => `three`,
  //       created: spyCC,
  //       activated: spyCA,
  //       deactivated: spyCDA,
  //       unmounted: spyCUM,
  //     },
  //   };
  //   const App = {
  //     render() {
  //       return h(KeepAlive, {max: 2}, () => {
  //         return h(views[viewRef.value]);
  //       });
  //     },
  //   };
  //   render(h(App), root);
  //   assertCount([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  //   viewRef.value = "b";
  //   await nextTick();
  //   assertCount([1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0]);
  //   viewRef.value = "c";
  //   await nextTick();
  //   // should prune A because max cache reached
  //   assertCount([1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0]);
  //   viewRef.value = "b";
  //   await nextTick();
  //   // B should be reused, and made latest
  //   assertCount([1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0]);
  //   viewRef.value = "a";
  //   await nextTick();
  //   // C should be pruned because B was used last so C is the oldest cached
  //   assertCount([2, 2, 1, 1, 1, 2, 2, 0, 1, 1, 1, 1]);
  // });
  // });
});
