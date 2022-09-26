import {
  ComponentInternalInstance,
  RendererElement,
  RendererNode,
  VNode,
  ComponentOptions,
  VNodeProps,
  SetupContext,
  getCurrentInstance,
  onMounted,
  onUpdated,
  watch,
} from "vue";

type ConcreteComponent = any;
// type VNode = any;

type MatchPattern = string | RegExp | (string | RegExp)[];

export interface KeepAliveProps {
  include?: MatchPattern;
  exclude?: MatchPattern;
  max?: number | string;
}

type CacheKey = string | number | symbol | ConcreteComponent;
type Cache = Map<CacheKey, VNode>;
type Keys = Set<CacheKey>;

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

export const isKeepAlive = (vnode: VNode): boolean =>
  (vnode.type as any).__isKeepAlive;

const KeepAliveImpl: ComponentOptions = {
  name: `MyKeepAlive`,
  __isKeepAlive: true,

  setup(props: KeepAliveProps, {slots}: SetupContext) {
    const instance = getCurrentInstance()!;

    const sharedContext = instance.ctx as KeepAliveContext;

    const cache: Cache = new Map();
    const keys: Keys = new Set();
    let current: VNode | null = null;

    const {
      renderer: {
        p: patch,
        m: move,
        um: _unmount,
        o: {createElement},
      },
    } = sharedContext;

    const storageContainer = createElement("div");

    sharedContext.activate = (vnode, container, anchor, isSVG, optimized) => {
      const instance = vnode.component!;
      move(vnode, container, anchor, MoveType.ENTER, null);
      // in case props have changed
      patch(
        instance.vnode,
        vnode,
        container,
        anchor,
        instance,
        null,
        false, //isSVG,
        vnode.slotScopeIds,
        optimized
      );
      // queuePostRenderEffect(() => {
      //   instance.isDeactivated = false;
      //   if (instance.a) {
      //     invokeArrayFns(instance.a);
      //   }
      //   const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
      //   if (vnodeHook) {
      //     invokeVNodeHook(vnodeHook, instance.parent, vnode);
      //   }
      // }, parentSuspense);
    };

    sharedContext.deactivate = (vnode: VNode) => {
      const instance = vnode.component!;
      move(vnode, storageContainer, null, MoveType.LEAVE, null);
      // queuePostRenderEffect(() => {
      //   if (instance.da) {
      //     invokeArrayFns(instance.da)
      //   }
      //   const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted
      //   if (vnodeHook) {
      //     invokeVNodeHook(vnodeHook, instance.parent, vnode)
      //   }
      //   instance.isDeactivated = true
      // }, parentSuspense)
    };

    let pendingCacheKey: CacheKey | null = null;

    const cacheSubtree = () => {
      if (pendingCacheKey != null) {
        cache.set(pendingCacheKey, instance.subTree);
      }
    };

    function unmount(vnode: VNode) {
      // reset the shapeFlag so it can be properly unmounted
      resetShapeFlag(vnode);
      _unmount(vnode, instance, null, true);
    }

    function pruneCache(filter?: (name: string) => boolean) {
      cache.forEach((vnode, key) => {
        const name = vnode.type.__name; //getComponentName(vnode.type as ConcreteComponent);
        if (name && (!filter || !filter(name))) {
          pruneCacheEntry(key);
        }
      });
    }

    function pruneCacheEntry(key: CacheKey) {
      const cached = cache.get(key) as VNode;
      if (!current || cached.type !== current.type) {
        unmount(cached);
      } else if (current) {
        // current active instance should no longer be kept-alive.
        // we can't unmount it now but it might be later, so reset its flag now.
        resetShapeFlag(current);
      }
      cache.delete(key);
      keys.delete(key);
    }

    watch(
      () => [props.include, props.exclude],
      ([include, exclude]) => {
        include && pruneCache((name) => matches(include, name));
        exclude && pruneCache((name) => !matches(exclude, name));
      },
      // prune post-render after `current` has been updated
      {flush: "post", deep: true}
    );

    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);

    return () => {
      pendingCacheKey = null;

      if (!slots.default) {
        return null;
      }

      const children = slots.default();
      const rawVNode = children[0];

      if (children.length > 1) {
      } else if (
        !isVNode(rawVNode) ||
        (!(rawVNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) &&
          !(rawVNode.shapeFlag & ShapeFlags.SUSPENSE))
      ) {
        current = null;
        return rawVNode;
      }

      let vnode = rawVNode;
      const comp = vnode.type as ConcreteComponent;

      const name = vnode.type.__name;

      const {include, exclude, max} = props;

      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) {
        current = vnode;
        return rawVNode;
      }

      const key = vnode.key == null ? comp : vnode.key;
      const cachedVNode = cache.get(key);

      pendingCacheKey = key;

      console.log(
        "%c [  ]-149",
        "font-size:13px; background:pink; color:#bf2c9f;",
        cachedVNode,
        vnode
      );

      if (cachedVNode) {
        vnode.el = cachedVNode.el;
        vnode.component = cachedVNode.component;

        // avoid vnode being mounted as fresh
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE;
        // make this key the freshest
        keys.delete(key);
        keys.add(key);
      } else {
        keys.add(key);

        // prune oldest entry
        if (max && keys.size > parseInt(max as string, 10)) {
          pruneCacheEntry(keys.values().next().value);
        }
      }

      // avoid vnode being unmounted
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
      current = vnode;

      return vnode; //"MyKeepAlive-default";
    };
  },
};

export const MyKeepAlive = KeepAliveImpl as any as {
  __isKeepAlive: true;
  new (): {
    $props: VNodeProps & KeepAliveProps;
  };
};

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false;
}

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

export const isString = (val: unknown): val is string =>
  typeof val === "string";
export const isArray = Array.isArray;

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

function resetShapeFlag(vnode: VNode) {
  let shapeFlag = vnode.shapeFlag;
  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
  }
  if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
  }
  vnode.shapeFlag = shapeFlag;
}

export const enum MoveType {
  ENTER,
  LEAVE,
  REORDER,
}
