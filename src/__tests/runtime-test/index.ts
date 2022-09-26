import {createRenderer, RootRenderFunction, ConcreteComponent} from "vue";

import {nodeOps, TestElement, logNodeOp, NodeOpTypes} from "./nodeOps";

export const extend = Object.assign;

const {render: baseRender, createApp: baseCreateApp} = createRenderer(
  extend({patchProp}, nodeOps)
);

export const render = baseRender as RootRenderFunction<TestElement>;

export function patchProp(
  el: TestElement,
  key: string,
  prevValue: any,
  nextValue: any
) {
  logNodeOp({
    type: NodeOpTypes.PATCH,
    targetNode: el,
    propKey: key,
    propPrevValue: prevValue,
    propNextValue: nextValue,
  });
  el.props[key] = nextValue;
  if (isOn(key)) {
    const event = key[2] === ":" ? key.slice(3) : key.slice(2).toLowerCase();
    (el.eventListeners || (el.eventListeners = {}))[event] = nextValue;
  }
}

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const isFunction = (val: unknown): val is Function =>
  typeof val === "function";

export function getComponentName(
  Component: ConcreteComponent,
  includeInferred = true
): string | false | undefined {
  return isFunction(Component)
    ? Component.displayName || Component.name
    : Component.name || (includeInferred && Component.__name);
}

export * from "./utils";
export * from "./nodeOps";
