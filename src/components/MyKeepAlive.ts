import {
  ComponentInternalInstance,
  RendererElement,
  RendererNode,
  VNode,
  SetupContext,
  getCurrentInstance,
  onMounted,
  onUpdated,
  KeepAliveProps,
  ConcreteComponent,
} from "vue";

export interface ComponentRenderContext {
  [key: string]: any;
  _: ComponentInternalInstance;
}

export interface KeepAliveContext extends ComponentRenderContext {
  renderer: Function; //RendererInternals
  activate: (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    isSVG: boolean,
    optimized: boolean
  ) => void;
  deactivate: (vnode: VNode) => void;
}

type CacheKey = string | number | symbol | ConcreteComponent;
type Cache = Map<CacheKey, VNode>; // 存储节点
type Keys = Set<CacheKey>;
//

//  2 3 1

export const MyKeepAlive = {
  name: "MyKeepAlive",
  __isKeepAlive: true,
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },

  setup(props: KeepAliveProps, {slots}: SetupContext) {
    const instance = getCurrentInstance()!;

    const sharedContext = instance.ctx as KeepAliveContext;

    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: {createElement},
      },
    } = sharedContext;

    const storageContainer = createElement("div");

    sharedContext.activate = (vnode, container, anchor) => {
      const instance = vnode.component;
      patch(instance?.vnode, vnode, container, anchor, instance);
      move(vnode, container, anchor, MoveType.ENTER);
    };

    sharedContext.deactivate = (vnode: VNode) => {
      move(vnode, storageContainer, null, MoveType.LEAVE);
    };

    function unmount(vnode: VNode) {
      resetShapeFlags(vnode);
      _unmount(vnode, instance, null, true);
    }

    function pruneCacheEntry(key: CacheKey) {
      const cached = cache.get(key);
      if (!current && cached?.type !== current?.type) {
        unmount(cached);
      } else if (current) {
        resetShapeFlags(current);
      }

      cache.delete(key);
      keys.delete(key);
    }
    let pendingCacheKey: CacheKey | null = null;

    const cacheSubtree = () => {
      if (pendingCacheKey !== null) {
        cache.set(pendingCacheKey, instance.subTree);
      }
    };

    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);

    const cache: Cache = new Map();
    const keys: Keys = new Set();
    let current: VNode | null = null;

    return () => {
      pendingCacheKey = null;
      if (!slots.default) {
        return null;
      }
      const children = slots.default();
      const vnode = children[0];

      if (children.length > 1) {
        console.warn("出错了");
        current = vnode;
        return children;
      }

      const comp = vnode.type as ConcreteComponent;

      const key = vnode.key === null ? comp : vnode.key;

      const {max, include, exclude} = props;

      const name = comp.__name;

      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) {
        current = vnode;
        return vnode;
      }

      pendingCacheKey = key;

      const cachedVNode = cache.get(key);
      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;

        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE;

        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);

        if (max && keys.size > parseInt(max as string, 10)) {
          // 修建缓存区域,删除最近最少使用的节点
          pruneCacheEntry(keys.values().next().value);
        }
      }

      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;

      current = vnode;
      return vnode;
    };
  },
};

export const enum ShapeFlags {
  ELEMENT = 1, // 原生DOM节点
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数组件
  STATEFUL_COMPONENT = 1 << 2, // 有状态组件
  TEXT_CHILDREN = 1 << 3, // 子节点是纯文本
  ARRAY_CHILDREN = 1 << 4, // 子节点是数组
  SLOTS_CHILDREN = 1 << 5, // 子节点是插槽
  TELEPORT = 1 << 6, // TELEPORT
  SUSPENSE = 1 << 7, // SUSPENSE
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // keep-alive 组件
  COMPONENT_KEPT_ALIVE = 1 << 9, // 已经被 keep-alive 的组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 组件
}

export const enum MoveType {
  ENTER,
  LEAVE,
  REORDER,
}

function resetShapeFlags(vnode: VNode) {
  let shapeFlag = vnode.shapeFlag;

  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
  } else if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
  }
  vnode.shapeFlag = shapeFlag;
}

type MatchPattern = string | RegExp | (string | RegExp)[];
export const isArray = Array.isArray;
export const isString = (val: unknown): val is string =>
  typeof val === "string";
function matches(pattern: MatchPattern, name: string): boolean {
  if (isArray(pattern)) {
    return pattern.some((p: string | RegExp) => matches(p, name));
  } else if (isString(pattern)) {
    return pattern.split(",").includes(name);
  } else if (pattern.test) {
    return pattern.test(name);
  }
  /* istanbul ignore next */
  return false;
}
