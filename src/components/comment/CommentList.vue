<template>
  <div class="comments" ref="commentsRef">
    <div
      class="comments-list"
      :style="`max-height: ${maxListHeight}px; overflow-y: auto;`"
      v-if="showChildComments && comments.length"
    >
      <Comment
        v-for="item in comments"
        :key="item.id"
        :comment="item"
        :showChildComments="true"
        @delete="deleteComment"
        @update="updateComment"
      >
        <template #default="{ comment }">
          <slot name="comment-header" :comment="comment" />
          <mtd-tooltip
            content="回复"
            placement="top"
            :popper-options="{
              removeOnDestroy: true,
            }"
          >
            <i class="mtdicon mtdicon-comment comment-icon" @click="replyComment(comment)" />
          </mtd-tooltip>
        </template>
      </Comment>
    </div>

    <div v-if="editorVisible" class="comment-editor-wrapper">
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
          <mtd-button class="disable-card-focus" size="small" type="default" @click="cancelComment">取消</mtd-button>
          <mtd-button
            class="m-left-12"
            size="small"
            type="primary"
            @click="addComment"
            :loading="createComentStatus === 'processing'"
            :disabled="saveDisabled"
          >
            发送
          </mtd-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, inject, Ref, PropType } from "vue-demi";
import Comment from "./Comment.vue";
import type {
  CommentVo,
  UpdateCommentParams,
  UserInfo,
  DeleteCommentParams,
  CommentEditor,
  AddCommentParams,
  ActionStatus,
} from "../../../types/word-comment";

export default defineComponent({
  name: "CommentList",
  components: { Comment },
  props: {
    comments: {
      type: Array as PropType<CommentVo[]>,
      default: () => [],
    },
    cardFocus: {
      type: Boolean,
      default: false,
    },
    showChildComments: {
      type: Boolean,
      default: true,
    },
    maxListHeight: {
      type: Number,
      default: 300,
    },
  },
  setup(props, { emit }) {
    const cardFocus: Ref<boolean> = inject("cardFocus");
    const cardId: Ref<number> = inject("cardId");
    const delExpandCardKey: Function = inject("delExpandCardKey");
    const scrollToReply: Function = inject("scrollToReply");
    const commenterInfos: Ref<UserInfo[]> = inject("commenterInfos");
    const createComentStatus: Ref<ActionStatus> = inject("createComentStatus");

    const commentEditorRef: Ref<CommentEditor> = ref(null);

    const editorVisible = ref(false);

    const saveDisabled = ref(false);
    const commentText = ref("");

    function handleCommentTextChange(value: string) {
      commentText.value = value;
      const text = commentEditorRef.value?.getText();
      saveDisabled.value = !text;
    }

    watch(cardFocus, (value) => {
      editorVisible.value = value;
    });

    watch(createComentStatus, (value, oldValue) => {
      if (oldValue === "processing" && value !== "error") {
        commentText.value = "";
      }
    });

    const replyComment = (comment: CommentVo) => {
      editorVisible.value = true;

      scrollToReply();

      setTimeout(() => {
        if (!commentEditorRef.value) return;

        commentEditorRef.value.focus();

        const { createdBy } = comment;
        const item = commenterInfos.value.find((item) => item.misId === createdBy);
        commentEditorRef.value.insertMention(createdBy, item?.userName || createdBy);
      });
    };

    const deleteComment = (comment: CommentVo) => {
      emit("delete-comment", { comment, id: cardId.value } as DeleteCommentParams);
    };

    const cancelComment = () => {
      commentText.value = "";
      delExpandCardKey(cardId.value);
    };

    const addComment = async () => {
      const params: AddCommentParams = {
        id: cardId.value,
        comment: {
          comment: commentText.value,
          mentioned: commentEditorRef.value.getMentionList(),
        },
      };
      emit("add-comment", params);
    };

    const updateComment = (data: Partial<UpdateCommentParams>) => {
      emit("update-comment", { ...data, id: cardId.value });
    };

    function handleMentionClick() {
      commentEditorRef.value.insertText("@");
    }

    return {
      commentText,
      editorVisible,
      replyComment,
      deleteComment,
      cancelComment,
      addComment,
      updateComment,
      commentEditorRef,
      handleMentionClick,
      handleCommentTextChange,
      saveDisabled,
      createComentStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.parker-editor {
  padding: 12px;
  border-top: 1px solid #edeef0;
}

.comment-icon {
  display: inline-block;
  // padding: 0 4px;
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

.disable-card-focus {
  & ::v-deep span {
    pointer-events: none;
  }
}
.comment-editor-wrapper {
  border-top: 1px solid #edeef0;
}
</style>
<style lang="scss">
.mtd-popconfirm-icon {
  font-size: 20px !important;
}

.mtd-popconfirm-actions {
  .mtd-btn-small {
    height: 22px !important;
    line-height: 20px !important;

    & > span {
      line-height: 20px !important;
    }
  }
}

.popover-more-btn {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    color: #0a70f5;
  }
}
</style>
