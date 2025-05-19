<template>
  <div :class="['comments-card', 'comments-card-border', 'border-yellow']" ref="cardRef" :data-card-id="cardId">
    <div class="card-header">
      <div class="card-title">{{ title }}</div>
    </div>
    <div class="annotation-content comment-editor-wrapper">
      <comment-editor
        ref="commentEditorRef"
        :height="90"
        class="editor"
        :value="commentText"
        @change="handleCommentTextChange"
      />
      <div class="operation">
        <div class="operation-left">
          <mtd-icon-button
            class="demo-icon-btn"
            type="secondary"
            icon="mtdicon mtdicon-at"
            @click="handleMentionClick"
          />
        </div>
        <div class="operation-right">
          <mtd-button class="disable-card-focus" size="small" type="default" @click="cancelCreate">取消</mtd-button>
          <mtd-button
            class="m-left-12"
            size="small"
            type="primary"
            :disabled="saveDisabled"
            @click="createCard"
            :loading="createWordStatus === 'processing'"
          >
            发送
          </mtd-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, inject, Ref } from "vue-demi";
import type { CommentVo, CommentEditor, ActionStatus } from "../../../types/word-comment.d";

export default defineComponent({
  name: "CreateCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    cardId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const resultRef: Ref<HTMLElement> = inject("resultRef");
    const cardRef = ref(null);
    const commentText = ref("");
    const commentEditorRef: Ref<CommentEditor> = ref(null);
    const saveDisabled = ref(false);
    const createWordStatus: Ref<ActionStatus> = inject("createWordStatus");

    function handleCommentTextChange(value: string) {
      commentText.value = value;
      const text = commentEditorRef.value?.getText();
      saveDisabled.value = !text;
    }

    const createCard = () => {
      const comment: CommentVo = {
        comment: commentText.value,
        mentioned: commentEditorRef.value.getMentionList(),
      };
      emit("create", comment);
    };

    const cancelCreate = () => {
      emit("cancel-create");
    };

    const cardListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !(target && typeof target.className === "string" && target.className.includes("disable-card-focus")) &&
        cardRef.value
      ) {
        if (
          !cardRef.value.contains(target) ||
          (typeof target.className === "string" && target.className.includes("disable-focus-hidden"))
        ) {
          cancelCreate();
        }
      }
    };

    onMounted(() => {
      resultRef.value.addEventListener("mousedown", cardListener, false);
    });

    onBeforeUnmount(() => {
      resultRef.value.removeEventListener("mousedown", cardListener, false);
    });

    function handleMentionClick() {
      commentEditorRef.value.insertText("@");
    }

    return {
      cardRef,
      commentText,
      createCard,
      cancelCreate,
      commentEditorRef,
      handleMentionClick,
      handleCommentTextChange,
      saveDisabled,
      createWordStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.comments-card {
  position: relative;
  width: 100%;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;

  &.comments-card-border {
    &.border-yellow {
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-top: 3px solid #ffd100;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    padding: 12px 12px 8px 12px;

    .card-title {
      font-weight: 500;
      font-size: 12px;
      line-height: 24px;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-header-btns {
      flex: none;
      padding: 0;
    }
  }
  .comment-editor-wrapper {
    border-top: 1px solid #edeef0;
  }
}

.header-btn {
  margin-top: 2px;
  display: inline-block;
  height: 20px;
}

.disable-focus-hidden {
  padding: 0;
  width: 20px;
  height: 20px;
  font-size: 20px;
}

.comment-icon {
  display: inline-block;
  padding: 0 4px;
  font-size: 18px;
  cursor: pointer;
  font-size: 16px;
  width: 24px;
  height: 24px;
  padding: 4px;
  line-height: 1;
  box-sizing: border-box;
  border-radius: 4px;

  &:hover {
    color: #0a70f5;
    background-color: rgba(0, 0, 0, 0.06);
  }
}

.comment-conclusion {
  border-top: 1px solid #666666;
  padding: 8px 12px;
}

.reply-number-block {
  display: flex;
  align-items: center;
  margin-top: -4px;
  margin-left: 20px;
  margin-bottom: 4px;
  padding: 0 8px 0 8px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
