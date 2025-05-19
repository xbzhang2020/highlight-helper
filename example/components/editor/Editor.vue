<template>
  <div class="editor-wrapper">
    <ParkerEditor
      ref="editorRef"
      :value="html"
      :show-header="showHeader"
      :providers="providers"
      :placeholder="placeholder"
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, watchEffect, shallowRef, ref, watch } from "vue";
import { ParkerEditor } from "@datafe/vue-parker-editor";
import { MentionProvider } from "./mention";

export default defineComponent({
  name: "MyEditor",
  components: { ParkerEditor },
  props: {
    value: {
      default: "",
      type: String,
    },
    readOnly: {
      default: false,
      type: Boolean,
    },
    showHeader: {
      default: false,
      type: Boolean,
    },
    placeholder: {
      default: "请输入内容...",
      type: String,
    },
  },
  setup(props, { emit }) {
    const editorRef = shallowRef(null);

    const providers = {
      mention: {
        providerClass: MentionProvider,
        params: [],
      },
    };

    const html = ref("");
    watch(
      () => props.value,
      () => {
        html.value = props.value || "";
      },
      { immediate: true },
    );

    function handleChange(val: string) {
      emit("change", val);
    }

    // 供外部组件调用
    function insertMention(id: string, name: string) {
      const editorIns = editorRef.value?.editorIns;
      if (!editorIns) return;

      const manager = editorIns.manager;
      const editorView = manager.editorView;
      const { mention } = editorView.state.schema.nodes;

      manager.dispatchTransaction(
        editorView.state.tr.replaceSelectionWith(
          mention.createAndFill({
            name: name,
            uid: id,
          }),
        ),
      );
    }

    // 供外部组件调用
    function insertText(text: string) {
      const editorIns = editorRef.value?.editorIns;
      if (!editorIns) return;

      if (text === "@") {
        setTimeout(() => {
          const { manager } = editorIns;
          manager.commands?.mention.insertAtMention();
        }, 0);
        return;
      }
    }

    // 供外部组件调用
    function focus() {
      const editorIns = editorRef.value?.editorIns;
      if (!editorIns) return;
      editorIns?.focus();
    }

    // 供外部组件调用
    function getHtml() {
      const editorIns = editorRef.value?.editorIns;
      if (!editorIns) return "";

      return editorIns.value();
    }

    // 供外部组件调用
    function getText(): string {
      const div = document.createElement("div");
      div.innerHTML = getHtml();
      return div.textContent || div.innerText;
    }

    // 供外部组件调用
    function getMentionList() {
      const html = getHtml();
      if (!html) return [];

      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;

      // 获取 mention 列表
      const nodes: NodeListOf<HTMLElement> = wrapper.querySelectorAll(`[data-type="ct-mention"]`);
      const mentions: string[] = [];
      nodes.forEach((node) => {
        if (node.dataset) {
          mentions.push(node.dataset.uid);
        }
      });
      return mentions;
    }

    watchEffect(() => {
      editorRef.value?.setEditable(!props.readOnly);
    });

    onBeforeUnmount(() => {
      const editorIns = editorRef.value?.editorIns;
      if (editorIns) {
        editorIns.destroyEditor();
      }
    });

    return {
      handleChange,
      insertMention,
      insertText,
      html,
      focus,
      getHtml,
      getText,
      getMentionList,
      MentionProvider,
      editorRef,
      providers,
    };
  },
});
</script>

<style lang="scss">
.editor-wrapper {
  .ct-editor-container {
    overflow: inherit;
    .ct-editor .ProseMirror {
      padding: 0;
    }
  }
  .ProseMirror p {
    margin: 4px 0;
  }
}
</style>
