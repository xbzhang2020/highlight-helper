import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";

import WordComment from "../src/index";
import Editor from "./components/wangeditor/Editor.vue";

const app = createApp(App);

app.use(ElementPlus);
app.use(WordComment, { commentEditor: Editor });
app.mount("#app");
