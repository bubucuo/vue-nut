import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import {MyKeepAlive} from "./components/MyKeepAlive";

const app = createApp(App);

app.mount("#app");

app.component("my-keep-alive", MyKeepAlive);
