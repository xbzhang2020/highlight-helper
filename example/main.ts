// import Vue from "vue";
// import App from "./App.vue";
import WordComment from "../src/index";
import Editor from "./components/wangeditor/Editor.vue";

// import "@ss/mtd-vue/lib/theme2/index.css";
// import MTD from "@ss/mtd-vue";

import { Boot } from "@wangeditor/editor";
import mentionModule from "@wangeditor/plugin-mention";
// import ParkerEditor from './components/editor/Editor.vue';

// 注册编辑器@插件
Boot.registerModule(mentionModule);

// Vue.use(MTD);
// Vue.use(WordComment, { commentEditor: Editor });

// new Vue({
//   render: (h) => h(App),
// }).$mount("#app");

import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";

const app = createApp(App);

app.use(ElementPlus);
app.use(WordComment, { commentEditor: Editor });

app.mount("#app");
