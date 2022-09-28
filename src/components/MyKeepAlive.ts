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
  // name: `my-keep-alive`,
  name: "my-keep-alive",
  __isKeepAlive: true,

  setup(props: KeepAliveProps, setupContext: SetupContext) {
    const {slots} = setupContext;

    console.log(
      "%c [  ]-29",
      "font-size:13px; background:pink; color:#bf2c9f;",
      slots.default
    );

    return () => {
      console.log(
        "%c [  ]-36",
        "font-size:13px; background:pink; color:#bf2c9f;"
      );
      return "omg";
    };
  },
};
