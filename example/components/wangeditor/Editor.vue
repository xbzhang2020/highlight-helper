<template>
  <div class="editor-wrapper">
    <div>
      <Editor
        style="min-height: 30px"
        v-model="html"
        mode="simple"
        :defaultConfig="editorConfig"
        @onChange="handleChange"
        @onCreated="handleCreated"
      />
      <mention-modal
        v-if="isShowModal"
        @hideMentionModal="hideMentionModal"
        @insertMention="insertMention"
        @deleteMention="deleteMention"
        @insertText="insertText"
      ></mention-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { IDomEditor, IEditorConfig } from "@wangeditor/editor";
import { Editor } from "@wangeditor/editor-for-vue";
import MentionModal from "./MentionModal.vue";
import { defineComponent, ref, onBeforeUnmount, shallowRef, watchEffect, nextTick } from "@vue/composition-api";
import { MentionElement } from "@wangeditor/plugin-mention";

export default defineComponent({
  name: "MyEditor",
  components: { Editor, MentionModal },
  props: {
    value: {
      default: "",
      type: String,
    },
    readOnly: {
      default: false,
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const html = ref("");

    watchEffect(() => {
      html.value = props.value || "";
    });

    const isShowModal = ref(false);

    function showMentionModal() {
      isShowModal.value = true;
    }

    function hideMentionModal() {
      isShowModal.value = false;
    }

    const editorConfig = ref<Partial<IEditorConfig>>({
      placeholder: "请输入内容...",
      EXTEND_CONF: {
        mentionConfig: {
          showModal: showMentionModal,
          hideModal: hideMentionModal,
        },
      },
      autoFocus: false,
    });

    const _editor = shallowRef<IDomEditor>(null);

    function handleCreated(editor: IDomEditor) {
      _editor.value = Object.seal(editor); // 【注意】一定要用 Object.seal() 否则会报错
      nextTick(() => {
        _editor.value.focus(true); // 自动聚焦
      });
    }

    function handleChange(editor: IDomEditor) {
      const curHtml = editor.getHtml();
      emit("change", curHtml);
    }

    function deleteMention() {
      const editor = _editor.value;
      if (!editor) return;
      editor.restoreSelection(); // 恢复选区
      editor.deleteBackward("character"); // 删除 '@'
    }

    function insertMention(id: string, name: string) {
      const mentionNode: MentionElement = {
        type: "mention", // 必须是 'mention'
        value: name,
        info: { id },
        children: [{ text: "" }], // 必须有一个空 text 作为 children
      };

      const editor = _editor.value;
      if (editor) {
        if (!editor.isFocused()) {
          editor.restoreSelection(); // 恢复选区
        }
        editor.deleteBackward("character"); // 删除 '@'
        editor.insertNode(mentionNode); // 插入 mention
        editor.move(1); // 移动光标
      }
    }

    function insertText(text: string) {
      const editor = _editor.value;
      if (!editor) return;
      editor.restoreSelection();
      editor.insertText(text);
    }

    function focus() {
      if (!_editor.value) return;
      _editor.value.focus(true);
    }

    function getHtml() {
      return _editor.value.getHtml();
    }

    function getText() {
      const div = document.createElement("div");
      div.innerHTML = getHtml();
      return div.textContent || div.innerText;
    }

    function getMentionList() {
      const html = getHtml();
      if (!html) return [];
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      // 获取 mention 列表
      const nodes: NodeListOf<HTMLElement> = wrapper.querySelectorAll(`[data-w-e-type="mention"]`);
      const mentions = [];
      nodes.forEach((node) => {
        const info = JSON.parse(decodeURIComponent(node.dataset.info));
        info && mentions.push(info.id);
      });
      return mentions;
    }

    watchEffect(() => {
      if (!_editor.value) return;
      if (props.readOnly) {
        _editor.value.disable();
      } else {
        _editor.value.enable();
      }
    });

    onBeforeUnmount(() => {
      const editor = _editor.value;
      if (editor == null) return;
      editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
    });

    return {
      isShowModal,
      editorConfig,
      hideMentionModal,
      showMentionModal,
      handleCreated,
      handleChange,
      insertMention,
      insertText,
      deleteMention,
      html,
      focus,
      getHtml,
      getText,
      getMentionList,
    };
  },
});
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="css">
.w-e-text-container [data-slate-editor] p {
  margin: 5px 0;
}
.w-e-text-placeholder {
  top: 4px;
}
</style>
