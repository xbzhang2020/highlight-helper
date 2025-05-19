<template>
  <div class="table-comments">
    <mtd-loading :loading="listLoading" class="card-list" ref="cardListRef">
      <template v-if="cardList.length || listLoading || createdMode">
        <Card
          v-for="(card, index) in cardList"
          :key="index"
          :card="card"
          :isFirstCard="index === 0"
          :isLastCard="index === cardList.length - 1"
          :expandCardKey="expandCardKey"
          @go-prev="goPrevCard"
          @go-next="goNextCard"
          @delete-card="handleDeleteCard"
          @focus="$emit('focus-card', $event)"
        >
          <template #comment-list="{ card }">
            <slot name="comment-list" :card="card" />
          </template>
        </Card>

        <CreateCard
          v-if="createdMode"
          :title="createdTitle"
          :card-id="createdId"
          @cancel-create="handleCancelCreateCard"
          @create="handleCreateCard"
        />
      </template>
      <div v-else-if="!cardList.length && !listLoading" :imgSize="100" class="empty-text">暂无数据</div>
    </mtd-loading>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, provide, watch, nextTick, PropType } from "vue-demi";
import Card from "./Card.vue";
import CreateCard from "./CreateCard.vue";
import type { CommentVo, WordCommentInfo } from "../../../types/word-comment.d";

export interface ScrollCardOptions {
  scrollToReply: boolean;
}

export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export default defineComponent({
  name: "CardPanel",
  components: { Card, CreateCard },
  props: {
    cardList: {
      type: Array as PropType<WordCommentInfo[]>,
      required: true,
    },
    commentAreaRef: {
      type: Element,
    },
    listLoading: {
      type: Boolean,
      dafault: false,
    },
    activeId: {
      type: [Number, String],
      default: null,
    },
  },
  setup(props, { emit }) {
    const resultRef = ref(props.commentAreaRef);
    watch(
      () => props.commentAreaRef,
      (val) => {
        resultRef.value = val;
      },
      { immediate: true },
    );
    provide("resultRef", resultRef);

    const expandAll = ref(false);

    // 展开的key
    const expandCardKey = ref<WordCommentInfo["id"]>(null);

    const changeExpandCardKey = (id: number | string) => {
      expandCardKey.value = id;
    };

    provide("changeExpandCardKey", changeExpandCardKey);

    const delExpandCardKey = (id: number) => {
      if (id && id === expandCardKey.value) {
        expandCardKey.value = null;
      }
    };
    provide("delExpandCardKey", delExpandCardKey);

    const cardListRef = ref(null);

    const scrollToCard = (
      id: number | string,
      options: ScrollCardOptions = {
        scrollToReply: false,
      },
    ) => {
      if (!cardListRef.value || !id) return;

      const srcollMethod = (id: string | number) => {
        const container = (cardListRef.value as any).$el as HTMLElement;
        const curCard = container.querySelector(`.comments-card[data-card-id="${id}"]`);
        if (!curCard) return;

        nextTick(() => {
          let top = curCard.getBoundingClientRect().top + container.scrollTop - container.offsetTop - 60;
          if (options.scrollToReply) top = top + curCard.clientHeight - 180;
          container.scrollTo({ top: top, behavior: "smooth" });
        });
      };

      changeExpandCardKey(id);
      srcollMethod(id);
    };
    provide("scrollToCard", scrollToCard);

    const goPrevCard = (id: number) => {
      const cardIndex = props.cardList.findIndex((card) => card.id === id);
      const preCardKey = props.cardList[cardIndex - 1]?.id;
      scrollToCard(preCardKey);
    };

    const goNextCard = (id: number) => {
      const cardIndex = props.cardList.findIndex((card) => card.id === id);
      const nextCardKey = props.cardList[cardIndex + 1]?.id;
      scrollToCard(nextCardKey);
    };

    const createdMode = ref(false);
    const createdTitle = ref("");
    const createdId = ref("");

    const openCreateCard = (title: string, id: string) => {
      createdMode.value = true;
      createdTitle.value = title;
      createdId.value = id;
      nextTick(() => {
        scrollToCard(id, { scrollToReply: true });
      });
    };

    const closeCreateCard = () => {
      createdMode.value = false;
      createdTitle.value = "";
      createdId.value = "";
    };

    const handleCreateCard = async (comment: CommentVo) => {
      emit("create-card", comment);
    };

    const handleCancelCreateCard = () => {
      emit("cancel-create-card", createdId.value);
      closeCreateCard();
    };

    const handleDeleteCard = (id: string) => {
      emit("delete-card", id);
    };

    watch(
      () => props.activeId,
      () => {
        if (!props.activeId || createdMode.value) return;
        nextTick(() => {
          scrollToCard(props.activeId);
        });
      },
      { immediate: true },
    );

    watch(
      () => expandCardKey.value,
      () => {
        emit("update:active-id", expandCardKey.value);
      },
    );

    return {
      cardListRef,
      expandAll,
      expandCardKey,
      changeExpandCardKey,
      delExpandCardKey,
      scrollToCard,
      goPrevCard,
      goNextCard,
      openCreateCard,
      closeCreateCard,
      createdMode,
      createdTitle,
      createdId,
      handleCreateCard,
      handleDeleteCard,
      handleCancelCreateCard,
    };
  },
});
</script>
<style lang="scss" scoped>
.table-comments {
  display: flex;
  flex-direction: column;
  overflow: auto;

  .comments-tabs-container {
    display: flex;
    padding: 0 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .comments-tabs-title {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.84);
      line-height: 24px;

      .comments-tabs-icon {
        font-size: 20px;
        margin-left: 2px;
        cursor: pointer;
        line-height: 1;
      }
    }
  }

  & ::v-deep {
    .mtd-radio-group {
      // background: @bg-gray;
      border-radius: 4px;
      padding: 2px;
    }

    .mtd-radio-button {
      // background: @bg-gray;
      border: none;
      line-height: 24px;
      height: 24px;
      padding: 0 10px;
      border-radius: 4px;
      margin: 0 1px;
    }

    .mtd-radio-button.mtd-radio-button-checked {
      // background: @bg-white;
      box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.24);
      // color: @text-color;
    }

    .mtd-radio-button.hover,
    .mtd-radio-button:hover {
      // color: @text-color;
      box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.24) !important;
    }
  }

  .empty-text {
    text-align: center;
    margin-top: 150px;
  }
}

.card-list {
  flex: 1;
  padding: 4px 12px;
  overflow: auto;
}

.comments-tabs {
  & ::v-deep .mtd-radio-button-inner {
    font-size: 12px;
  }
}
</style>
