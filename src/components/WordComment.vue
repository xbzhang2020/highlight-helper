<template>
  <div class="comment-wrapper">
    <div class="comment-header">
      <span class="title">
        评论
        <span>{{ dataSource.length }}</span>
      </span>
      <div class="operation">
        <slot name="comment-filter" />
        <div class="operation-separator"></div>
        <mtd-tooltip content="收起评论" size="small" placement="top">
          <mtd-icon-button type="secondary" icon="mtdicon mtdicon-close" @click="$emit('close')" />
        </mtd-tooltip>
      </div>
    </div>

    <CardPanel
      v-if="resultRef"
      :cardList="dataSource"
      ref="cardPanelRef"
      class="comment-content"
      :commentAreaRef="resultRef"
      :active-id="activeId"
      @cancel-create-card="$emit('cancel-create-card', $event)"
      @create-card="handleCreateCard"
      @delete-card="handleDeleteCard"
      @update:active-id="handleUpdatAactiveId"
      @focus-card="$emit('focus-card', $event)"
    >
      <template #comment-list="{ card }">
        <CommentList
          ref="commentArea"
          :comments="card.comments"
          @reply-comment="addComment"
          @update-comment="updateComment"
          @delete-comment="deleteComment"
          @add-comment="addComment"
        >
          <template #comment-render="{ comment }">
            <div>
              {{ comment.content }}
            </div>
          </template>
        </CommentList>
      </template>
    </CardPanel>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch, provide, Ref, computed } from "vue-demi";
import CardPanel from "./card/CardPanel.vue";
import CommentList from "./comment/CommentList.vue";
import { CommentService } from "../services/comment";
import { UserService } from "../services/user";
import type {
  WordCommentInfo,
  CommentVo,
  DeleteCommentParams,
  UpdateCommentParams,
  UserInfo,
  AddCommentParams,
} from "../../types/word-comment";

export default defineComponent({
  props: {
    dataSource: {
      default: () => [],
      type: Array as PropType<WordCommentInfo[]>,
    },
    activeId: [Number, String],
  },
  components: { CardPanel, CommentList },
  setup(props, { emit }) {
    const cardPanelRef = ref<InstanceType<typeof CardPanel>>(null);
    const commentText = ref("");

    const deleteComment = (params: DeleteCommentParams) => {
      emit("delete-comment", params);
    };

    const addComment = async (params: AddCommentParams) => {
      emit("add-comment", params);
    };

    const updateComment = async (params: UpdateCommentParams) => {
      emit("update-comment", params);
    };

    const resultRef = ref(document.getElementById("word-comment-container"));

    onMounted(() => {
      resultRef.value = document.getElementById("word-comment-container");
    });

    const handleCreateCard = (comment: CommentVo) => {
      emit("create-card", comment);
    };

    const openCreateCard = (title: string, id: string) => {
      cardPanelRef.value?.openCreateCard(title, id);
    };

    const closeCreateCard = () => {
      cardPanelRef.value.closeCreateCard();
    };

    const scrollToCard = (id: WordCommentInfo["id"]) => {
      cardPanelRef.value?.scrollToCard(id);
    };

    const handleUpdatAactiveId = (val: string) => {
      emit("update:active-id", val);
    };

    const handleDeleteCard = async (id: string) => {
      emit("delete-card", id);
    };

    const commenterInfos: Ref<UserInfo[]> = ref([]);

    const misIds = computed(() => {
      const list = CommentService.getCommenters(props.dataSource);
      return list;
    });

    const updateCommenterInfos = async (dataSource: WordCommentInfo[]) => {
      const list = CommentService.getCommenters(dataSource);
      commenterInfos.value = await UserService.getUserInfos(list);
    };

    watch(
      misIds,
      (value, oldValue) => {
        if (oldValue && value.join() === oldValue.join()) {
          return;
        }
        updateCommenterInfos(props.dataSource);
      },
      { immediate: true },
    );

    provide("commenterInfos", commenterInfos);

    return {
      handleCreateCard,
      commentText,
      resultRef,
      cardPanelRef,
      deleteComment,
      addComment,
      updateComment,
      openCreateCard,
      closeCreateCard,
      handleUpdatAactiveId,
      handleDeleteCard,
      misIds,
      scrollToCard,
    };
  },
});
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
}
.operation {
  display: flex;
  align-items: center;
  .operation-separator {
    display: inline-block;
    height: 16px;
    margin: 0 12px;
    border-left: 1px solid rgb(234, 236, 240);
  }
}
</style>
