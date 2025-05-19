<template>
  <div class="card-comment-wrapper">
    <CommentTemplate
      :comment="comment"
      :canEdit="canEdit(comment.createdBy)"
      :showMore="true"
      @update="$emit('update', $event)"
      @delete="$emit('delete', $event)"
    >
      <slot :comment="comment" />
      <template #more>
        <slot :comment="comment" name="more" />
      </template>
    </CommentTemplate>

    <template v-if="showChildComments">
      <CommentTemplate
        v-for="subComment in comment.subComments"
        class="comment-child"
        :key="subComment.id"
        :comment="subComment"
        :canEdit="canEdit(subComment.createdBy)"
        :showMore="true"
        @update="$emit('update', $event)"
        @delete="$emit('delete', $event)"
      >
        <slot :comment="subComment" />
        <template #more>
          <slot :comment="subComment" name="more" />
        </template>
      </CommentTemplate>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, inject, Ref } from "vue-demi";
import CommentTemplate from "./CommentTemplate.vue";
import type { UserInfo, CommentVo } from "../../../types/word-comment.d";

export default defineComponent({
  components: { CommentTemplate },
  props: {
    comment: {
      type: Object as PropType<CommentVo>,
      default: () => ({}) as CommentVo,
    },
    showChildComments: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const userInfo: Ref<UserInfo> = inject("userInfo");

    const canEdit = (createdBy: string) => {
      return userInfo.value?.misId === createdBy;
    };

    return {
      userInfo,
      canEdit,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-comment-wrapper {
  margin: 0 12px;
  margin-bottom: 12px;
  height: 100%;
  &:last-child {
    border-bottom: none;
  }
}
</style>
