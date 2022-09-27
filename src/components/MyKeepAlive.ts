import {VNodeProps, KeepAliveProps} from "vue";

const MyKeepAliveImpl = {
  name: "MyKeepAlive",
  __isKeepAlive: true,

  setup() {
    return () => {
      return null;
    };
  },
};

export const MyKeepAlive = MyKeepAliveImpl as any as {
  __isKeepAlive: true;
  new (): {
    $props: VNodeProps & KeepAliveProps;
  };
};
