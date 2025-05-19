<template>
  <div
    :class="[
      'comments-card',
      `comments-card-${card.id}`,
      'comments-card-border',
      cardFocus ? 'border-yellow comments-card-focus' : '',
    ]"
    :data-card-id="card.id"
    ref="cardRef"
  >
    <div class="card-status" v-if="card.status === 'mismatched'">
      <div class="card-status-text">
        <i class="mtdicon mtdicon-info-circle"></i>
        <span>原文已删除</span>
      </div>
      <div v-show="!cardFocus" class="card-status-splitline"></div>
    </div>

    <div class="card-header">
      <div class="card-title">
        <mtd-tooltip :content="card.content" size="small" placement="top">
          <span>{{ card.content }}</span>
        </mtd-tooltip>
      </div>
      <div class="card-header-btns">
        <mtd-tooltip content="上一条" class="header-btn" placement="top">
          <mtd-icon-button
            class="disable-focus-hidden"
            size="small"
            type="secondary"
            icon="mtdicon mtdicon-up-thick disable-focus-hidden"
            @mousedown="goPrevCard"
            :disabled="isFirstCard"
          />
        </mtd-tooltip>
        <mtd-tooltip content="下一条" class="header-btn" placement="top">
          <mtd-icon-button
            class="disable-focus-hidden"
            size="small"
            type="secondary"
            icon="mtdicon mtdicon-down-thick disable-focus-hidden"
            @mousedown="goNextCard"
            :disabled="isLastCard"
          />
        </mtd-tooltip>
        <div class="separator"></div>
        <mtd-popconfirm
          placement="bottom"
          message="确定此评论已解决？"
          :okButtonProps="{
            type: 'primary',
          }"
          @ok="resolveComment"
        >
          <mtd-tooltip content="解决评论" class="header-btn" placement="top">
            <mtd-icon-button
              class="disable-focus-hidden resolve-btn"
              size="small"
              type="secondary"
              icon="mtdicon mtdicon-success-o disable-card-focus"
            />
          </mtd-tooltip>
        </mtd-popconfirm>
      </div>
    </div>
    <div class="annotation-content">
      <slot name="comment-list" :card="card" />
      <div v-show="!cardFocus" class="reply-tip" @click="changeExpandCardKey(card.id)">回复...</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  provide,
  onMounted,
  onBeforeUnmount,
  inject,
  computed,
  Ref,
  PropType,
} from "vue-demi";
import type { WordCommentInfo } from "../../../types/word-comment.d";

export default defineComponent({
  name: "Card",
  props: {
    card: {
      type: Object as PropType<WordCommentInfo>,
      required: true,
    },
    isFirstCard: {
      type: Boolean,
      required: true,
    },
    isLastCard: {
      type: Boolean,
      required: true,
    },
    expandCardKey: {
      type: [Number, String],
    },
    createdMode: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, { emit }) {
    const resultRef: Ref<HTMLElement> = inject("resultRef");
    const changeExpandCardKey: Function = inject("changeExpandCardKey");
    const scrollToCard: Function = inject("scrollToCard");

    const cardRef = ref(null);

    const cardFocus = computed(() => {
      return String(props.expandCardKey) === String(props.card.id);
    });

    const cardId = computed(() => {
      return props.card.id;
    });

    provide("cardFocus", cardFocus);
    provide("cardId", cardId);

    const scrollToReply = () => {
      if (scrollToCard) scrollToCard(props.card.id, { scrollToReply: true });
    };
    provide("scrollToReply", scrollToReply);

    const cardListener = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const classList = target?.classList;
      const isContained = cardRef.value?.contains(target);

      if (
        !target ||
        !isContained ||
        classList.contains("disable-card-focus") ||
        classList.contains("disable-focus-hidden")
      ) {
        return;
      }
      changeExpandCardKey(props.card.id);
      emit("focus", props.card.id);
    };

    const goPrevCard = () => {
      emit("go-prev", props.card.id);
    };

    const goNextCard = () => {
      emit("go-next", props.card.id);
    };

    const resolveComment = () => {
      emit("delete-card", props.card.id);
    };

    onMounted(() => {
      resultRef.value.addEventListener("click", cardListener, false);
    });

    onBeforeUnmount(() => {
      resultRef.value.removeEventListener("click", cardListener, false);
    });

    return {
      cardRef,
      cardFocus,
      goPrevCard,
      goNextCard,
      resolveComment,
      scrollToReply,
      changeExpandCardKey,
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
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;

  &.comments-card-border {
    &.border-yellow {
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-top: 5px solid #ffd100;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .card-status {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: rgba(17, 25, 37, 0.451);
    padding: 8px 12px 0;
    line-height: 16px;
    .mtdicon {
      margin-right: 4px;
    }
    .card-status-splitline {
      height: 1px;
      margin-top: 8px;
      border-top: 1px solid rgba(17, 25, 37, 0.1);
    }
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px 12px;
    margin-bottom: 8px;
    line-height: 24px;

    .card-title {
      font-weight: 400;
      font-size: 12px;
      line-height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
      padding-right: 4px;
      padding-left: 8px;
      position: relative;
      color: rgba(0, 0, 0, 0.35);
      font-family: PingFangSC-Regular;
      cursor: initial;
      &::before {
        content: "";
        position: absolute;
        width: 2px;
        height: 12px;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        background-color: rgba(17, 25, 37, 0.15);
        border-radius: 2px;
      }
    }
  }

  .card-header-btns {
    flex: none;
    padding: 0;
    display: none;
    align-items: center;
    line-height: 24px;
    height: 24px;
    .separator {
      display: inline-block;
      height: 16px;
      margin: 0 12px;
      border-left: 1px solid rgb(234, 236, 240);
    }
  }

  &:hover {
    .card-header-btns {
      display: flex;
    }
  }
  &.comments-card-focus {
    .card-header-btns {
      display: flex;
    }
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

.reply-tip {
  color: rgba(0, 0, 0, 0.35);
  padding: 12px;
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
