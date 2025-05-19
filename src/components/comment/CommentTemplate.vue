<template>
  <div
    :class="[
      'wx-comment',
      className,
      !showOperationsTooltip ? 'comment-header-btns-show' : '',
    ]"
  >
    <div class="wx-comment-avatar">
      <Avatar :mis-id="comment.createdBy" :image-url="commenterInfo.imageUrl" />
    </div>

    <div class="wx-comment-content">
      <div class="wx-comment-header">
        <div class="comment-header-left">
          <span class="comment-name">{{ commenterInfo.userName }}</span>
          <span
            class="comment-name"
            v-if="comment.parentCommenter && showReply"
          >
            {{ comment.parentCommenterName }}
          </span>
          <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
        </div>

        <div class="comment-header-btns">
          <slot />
          <el-popover
            v-if="showMore && canEdit"
            trigger="hover"
            placement="bottom"
            @input="handleTooltipInputChange"
          >
            <template #reference>
              <el-icon class="comment-icon disable-card-focus"
                ><More
              /></el-icon>
            </template>
            <div class="popover-content">
              <div class="popover-more-btn" @click="handleCommentModify">
                <el-icon><Edit /></el-icon>
                编辑
              </div>
              <el-popconfirm
                placement="left"
                title="确定删除此评论吗？"
                @confirm="handleDelete"
              >
                <template #reference>
                  <div class="popover-more-btn">
                    <el-icon class="disable-card-focus"><Delete /></el-icon>
                    删除
                  </div>
                </template>
              </el-popconfirm>
              <slot name="more" />
            </div>
          </el-popover>
        </div>
      </div>

      <div
        :class="[
          'comment-editor-wrapper',
          !edit && 'readonly-comment-editor-wrapper',
        ]"
        style="padding: 0"
      >
        <comment-editor
          class="editor"
          :readOnly="!edit"
          :value="commentText"
          @change="handleCommentTextChange"
          ref="commentEditorRef"
        />
        <div class="operation" v-if="edit">
          <div class="operation-left"></div>
          <div class="operation-right">
            <el-button size="small" type="default" @click="cancelUpdateComment"
              >取消</el-button
            >
            <el-button
              class="m-left-12"
              size="small"
              type="primary"
              @click="updateComment"
              :disabled="saveDisabled"
              :loading="updateCommentStatus === 'processing'"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  PropType,
  Ref,
  nextTick,
  inject,
  computed,
  watch,
} from "vue-demi";
import Avatar from "./Avatar.vue";
import type {
  CommentVo,
  UpdateCommentParams,
  UserInfo,
  CommentEditor,
  ActionStatus,
} from "../../../types/word-comment.d";
import { formatTime } from "../../utils/index";
import { Edit, More, Delete } from "@element-plus/icons-vue";

export default defineComponent({
  components: { Avatar, Edit, More, Delete },
  props: {
    comment: {
      type: Object as PropType<CommentVo>,
      default: () => ({}) as CommentVo,
    },
    className: {
      type: String,
      default: "",
    },
    showReply: {
      type: Boolean,
      default: true,
    },
    showMore: {
      type: Boolean,
      default: true,
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const edit = ref(false);
    const commentText = ref(props.comment.comment);

    watch(
      () => props.comment.comment,
      () => {
        if (edit.value) return;
        commentText.value = props.comment.comment;
      }
    );

    const saveDisabled = ref(false);

    const commentEditorRef: Ref<CommentEditor> = ref(null);
    const updateCommentStatus: Ref<ActionStatus> = inject(
      "updateCommentStatus"
    );

    function handleCommentTextChange(value: string) {
      commentText.value = value;
      const text = commentEditorRef.value?.getText();
      saveDisabled.value = !text;
    }

    const handleCommentModify = () => {
      edit.value = true;
      nextTick(() => {
        setTimeout(() => {
          commentEditorRef.value?.focus();
        });
      });
    };

    const updateComment = () => {
      const data: Partial<UpdateCommentParams> = {
        comment: {
          ...props.comment,
          comment: commentText.value,
          mentioned: commentEditorRef.value.getMentionList(),
        },
      };
      emit("update", data);
    };

    const handleDelete = () => {
      emit("delete", props.comment);
    };

    const cancelUpdateComment = () => {
      edit.value = false;
      commentText.value = props.comment.comment;
    };

    const commenterInfos: Ref<UserInfo[]> = inject("commenterInfos");
    const commenterInfo = computed(() => {
      return (
        commenterInfos.value.find(
          (item) => item.misId === props.comment.createdBy
        ) || {}
      );
    });

    watch(updateCommentStatus, (value, oldValue) => {
      if (oldValue === "processing" && value !== "error") {
        edit.value = false;
      }
    });

    const showOperationsTooltip = ref(false);

    function handleTooltipInputChange(visible: boolean) {
      showOperationsTooltip.value = visible;
    }

    return {
      edit,
      commentText,
      commentEditorRef,
      updateComment,
      cancelUpdateComment,
      handleCommentModify,
      commenterInfo,
      handleDelete,
      saveDisabled,
      handleCommentTextChange,
      updateCommentStatus,
      formatTime,
      showOperationsTooltip,
      handleTooltipInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.wx-comment {
  width: 100%;
  display: flex;

  &.comment-child {
    padding-left: 24px;
  }

  .wx-comment-avatar {
    margin-right: 4px;
    flex: none;
  }

  .wx-comment-content {
    margin-left: 4px;
    flex: 1;

    // overflow: hidden;
    word-break: break-all;
  }

  .wx-comment-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 20px;
    font-size: 12px;

    .comment-header-left {
      flex: 1;
      overflow: hidden;

      .comment-name {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        color: rgba(0, 0, 0, 0.84);
        letter-spacing: 0;
        padding-right: 8px;
      }
    }

    .comment-header-btns {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
    }
  }

  &.comment-header-btns-show {
    .comment-header-btns {
      display: none;
    }

    &:hover {
      .comment-header-btns {
        display: flex;
      }
    }
  }

  .comment-time {
    font-weight: 400;
    font-family: SFProText-Regular, sans-serif;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.35);
    letter-spacing: 0;
    text-align: justify;
    line-height: 20px;
  }

  .comment-editor-wrapper {
    padding: 0;
  }
}

.comment-del-tip {
  margin: 10px auto;
  padding: 0 12px;
  height: 24px;
  background: rgba(0, 0, 0, 0.04);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
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
