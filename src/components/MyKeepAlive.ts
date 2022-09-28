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
  defineCustomElement,
  KeepAliveProps,
  isVNode,
  defineComponent,
  renderSlot,
  h,
} from "vue";

export const MyKeepAlive = {
  name: "MyKeepAlive",
  __isKeepAlive: true,

  setup(props: KeepAliveProps, setupContext: SetupContext) {
    const {slots} = setupContext;

    return () => {
      return "omg";
    };
  },
};
