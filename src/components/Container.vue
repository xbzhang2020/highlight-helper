<template>
  <div class="container-wrapper">
    <mtd-tooltip content="展开评论" placement="top" v-show="!localShowComment">
      <div class="expand-comment-btn" @click="openComment">
        <i class="mtdicon mtdicon-comment"></i>
      </div>
    </mtd-tooltip>

    <div ref="container" id="word-comment-container" class="word-comment-container">
      <div ref="articleRef" class="article" @click="handleArticleClick">
        <slot name="article"></slot>
      </div>

      <transition name="word-comment-slide-fade">
        <WordComment
          v-show="localShowComment"
          ref="commentRef"
          class="comment"
          :dataSource="commentList"
          :active-id="activeId"
          @close="handleCommentClose"
          @cancel-create-card="handleCancelCreateCard"
          @create-card="handleCreateCard"
          @delete-card="handleDeleteCard"
          @delete-comment="handleDeleteComment"
          @add-comment="hanldeAddComment"
          @update-comment="hanldeUpdateComment"
          @update:active-id="handleUpdateActiveId"
          @focus-card="handleFocusCard"
        >
          <template #comment-filter>
            <mtd-dropdown trigger="click" placement="bottom-end">
              <mtd-tooltip content="筛选" size="small" placement="top">
                <mtd-icon-button type="secondary" icon="mtdicon mtdicon-filter-o" />
              </mtd-tooltip>
              <mtd-dropdown-menu slot="dropdown" style="width: 220px" class="word-comment-filter-menu">
                <mtd-dropdown-menu-item class="filter-menu-item" @click="commentFilterType = 'all'">
                  <div class="filter-menu-item-left filter-menu-item-main">
                    <span>
                      全部
                      <span>{{ dataSource.length }}</span>
                    </span>
                  </div>
                  <div v-if="commentFilterType === 'all'">
                    <i class="mtdicon mtdicon-check filter-menu-item-check"></i>
                  </div>
                </mtd-dropdown-menu-item>
                <mtd-dropdown-menu-item class="filter-menu-item" @click="commentFilterType = 'related'">
                  <div class="filter-menu-item-left">
                    <div class="filter-menu-item-main">
                      <span>与我相关 {{ myRelatedComments.length }}</span>
                    </div>
                    <div class="filter-menu-item-desc"><span>仅展示我添加的或 @ 我的评论</span></div>
                  </div>
                  <div v-if="commentFilterType === 'related'">
                    <i class="mtdicon mtdicon-check filter-menu-item-check"></i>
                  </div>
                </mtd-dropdown-menu-item>
              </mtd-dropdown-menu>
            </mtd-dropdown>
          </template>
        </WordComment>
      </transition>
    </div>

    <div ref="popoverRef" class="popover-button" @click="handlePopoverClick">
      <slot name="popover">
        <button>+</button>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  PropType,
  provide,
  computed,
  watchEffect,
} from "vue-demi";
import { UnderlineService } from "../services/underline";
import WordComment from "./WordComment.vue";
import type {
  WordCommentInfo,
  WordInfo,
  CommentVo,
  DeleteCommentParams,
  UpdateCommentParams,
  AddCommentParams,
  UserInfo,
  ActionStatus,
  WordCommentFilterType,
  GetWordContainerId,
  GetWordContainer,
} from "../../types/word-comment.d";

function showSelectionPopover(target: HTMLElement, container: HTMLElement) {
  if (!target) return;
  const range = UnderlineService.getSelectionRange(container);
  if (!range) return;

  // 定位右下角
  const rects = range.getClientRects();
  const lastRect = rects[rects.length - 1];
  const offset = 0;
  target.style.display = "block";
  target.style.top = lastRect.bottom + offset + "px";
  target.style.left = lastRect.right + offset + "px";
}

function hideSelectionPopover(target: HTMLElement) {
  if (target) {
    target.style.display = "none";
  }
}

export default defineComponent({
  name: "WordCommentContainer",
  props: {
    dataSource: {
      default: () => [] as WordCommentInfo[],
      type: Array<WordCommentInfo>,
    },
    showComment: {
      default: false,
      type: Boolean,
    },
    getWordContainerId: {
      type: Function as PropType<GetWordContainerId>,
      default: (container: HTMLElement) => container.dataset.pid,
    },
    getWordContainer: {
      type: Function as PropType<GetWordContainer>,
      default: (id: WordInfo["divId"]) => {
        return document.querySelector('[data-pid="' + id + '"]');
      },
    },
    createWord: {
      type: Function as PropType<(range: WordInfo, comment: CommentVo) => Promise<void>>,
      required: true,
    },
    deleteWord: {
      type: Function as PropType<(id: WordCommentInfo["id"]) => Promise<void>>,
      required: true,
    },
    deleteComment: {
      type: Function as PropType<(params: DeleteCommentParams) => Promise<void>>,
      required: true,
    },
    addComment: {
      type: Function as PropType<(params: AddCommentParams) => Promise<void>>,
      required: true,
    },
    updateComment: {
      type: Function as PropType<(params: UpdateCommentParams) => Promise<void>>,
      required: true,
    },
    userInfo: {
      type: Object as PropType<UserInfo>,
      default: () => ({}) as UserInfo,
    },
    contentSelector: {
      type: String,
      default: ".content",
    },
  },
  components: {
    WordComment,
  },
  setup(props, { emit }) {
    const underlineService = new UnderlineService();

    watchEffect(() => {
      if (props.getWordContainer) {
        underlineService.getWordContainer = props.getWordContainer;
      }
      if (props.getWordContainerId) {
        underlineService.getWordContainerId = props.getWordContainerId;
      }
      if (props.contentSelector) {
        underlineService.wordContainerSelector = props.contentSelector;
      }
    });

    const articleRef = ref<HTMLElement>(null);
    const commentRef = ref<InstanceType<typeof WordComment>>(null);
    const popoverRef = ref<HTMLElement>(null);

    const activeId = ref<WordCommentInfo["id"]>(null);
    const activeRangeInfo = ref<WordInfo>(null);

    const userInfo = computed(() => props.userInfo);
    provide("userInfo", userInfo);

    const createWordStatus = ref<ActionStatus>(null);
    provide("createWordStatus", createWordStatus);

    const createComentStatus = ref<ActionStatus>(null);
    provide("createComentStatus", createComentStatus);

    const updateCommentStatus = ref<ActionStatus>(null);
    provide("updateCommentStatus", updateCommentStatus);

    const localShowComment = ref(false);

    watch(
      () => props.showComment,
      () => {
        localShowComment.value = props.showComment;
      },
      { immediate: true },
    );

    watch(
      localShowComment,
      (val) => {
        emit("update:show-comment", val);
      },
      { immediate: true },
    );

    const commentFilterType = ref<WordCommentFilterType>("all");

    const myRelatedComments = computed(() => {
      const misId = userInfo.value?.misId;
      if (!misId) return [];
      return props.dataSource.filter((item) =>
        item.comments.some((sumItem) => sumItem.createdBy === misId || sumItem.mentioned.includes(misId)),
      );
    });

    const commentList = computed(() => {
      if (commentFilterType.value === "related") {
        return myRelatedComments.value;
      }
      return props.dataSource;
    });

    watch(commentList, (value, oldValue) => {
      nextTick(() => {
        // 删除失效的划词
        const deleteWords = value.filter((item) => item.status === "mismatched");
        oldValue?.forEach((item) => {
          if (!value.some(({ id }) => id === item.id)) {
            deleteWords.push(item);
          }
        });
        if (deleteWords.length) {
          underlineService.unhighlightWords(deleteWords);
        }

        let words = commentList.value;

        // 新创建的划词，替换划词的id
        if (UnderlineService.isTempWordId(activeId.value) && activeRangeInfo.value) {
          const sameWord = UnderlineService.hasWord(activeRangeInfo.value, commentList.value);
          if (sameWord) {
            UnderlineService.replaceWordId(activeId.value, sameWord.id);
            words = words.filter((item) => item.id !== sameWord.id);
            activeId.value = sameWord.id;
          }
        }

        // 高亮其余的划词
        highlightWords(words, false);
      });
    });

    function highlightWords(words?: WordInfo[], active = true) {
      words = words || commentList.value;
      const mismatchedWords = underlineService.highlightWords(words);
      if (mismatchedWords.length) {
        emit("mismatch", mismatchedWords);
      }

      if (activeId.value && active) {
        const data = commentList.value.find((item) => item.id === activeId.value);
        underlineService.activateWord(data);
      }
    }

    function handleMouseup(event: MouseEvent) {
      // 获取内容所在的容器元素
      const eleTarget = event.target as HTMLElement;
      const container = eleTarget?.closest(underlineService.wordContainerSelector) as HTMLElement;
      if (!container) return;
      hideSelectionPopover(popoverRef.value);
      showSelectionPopover(popoverRef.value, container);
    }

    function handlePopoverClick(event: MouseEvent) {
      hideSelectionPopover(popoverRef.value);

      const data = underlineService.getSelectionWordInfo();
      const sameRange = UnderlineService.hasWord(data, commentList.value);
      activeRangeInfo.value = { ...data };

      // 处理划词
      if (sameRange) {
        activeId.value = sameRange.id;
        underlineService.activateWord(sameRange);
      } else {
        const id = UnderlineService.highlightSelectionWord();
        underlineService.activateWord({
          ...data,
          id,
        });
        activeId.value = id || null;
      }

      // 处理评论
      openComment();
      if (!sameRange) {
        createCard(activeRangeInfo.value.content, activeId.value as string);
      }
    }

    function handleArticleClick(event: MouseEvent) {
      const wordElement = UnderlineService.getClosetWordElement(event.target as HTMLElement);
      if (!wordElement) return;

      activeId.value = UnderlineService.getWordId(wordElement);
      activeRangeInfo.value = commentList.value.find((item) => item.id === activeId.value);

      // 处理划词
      underlineService.activateWord(activeRangeInfo.value);

      // 处理评论
      openComment();
      nextTick(() => {
        commentRef.value.scrollToCard(activeId.value);
      });
    }

    function openComment() {
      localShowComment.value = true;
    }

    function handleCommentClose() {
      localShowComment.value = false;
      underlineService.deactivateWord();
    }

    function createCard(title: string, id: string) {
      nextTick(() => {
        commentRef.value.openCreateCard(title, id);
      });
    }

    function handleUpdateActiveId(val: number) {
      activeId.value = val;
      const data = commentList.value.find((item) => item.id === activeId.value);
      underlineService.activateWord(data);
    }

    async function handleCreateCard(comment: CommentVo) {
      if (typeof props.createWord !== "function") return;
      try {
        createWordStatus.value = "processing";

        await props.createWord(activeRangeInfo.value, comment);

        commentRef.value.closeCreateCard();
        createWordStatus.value = null;
      } catch (e) {
        createWordStatus.value = "error";
      }
    }

    const handleDeleteCard = async (id: number) => {
      if (typeof props.deleteWord !== "function") return;
      try {
        await props.deleteWord(id);
      } catch (e) {
        console.log(e);
      }
    };

    const handleDeleteComment = async (params: DeleteCommentParams) => {
      if (typeof props.deleteComment !== "function") return;
      try {
        await props.deleteComment(params);
      } catch (e) {
        console.log(e);
      }
    };

    const hanldeAddComment = async (params: AddCommentParams) => {
      if (typeof props.addComment !== "function") return;
      try {
        createComentStatus.value = "processing";
        await props.addComment(params);
        createComentStatus.value = null;
      } catch (e) {
        createComentStatus.value = "error";
      }
    };

    const hanldeUpdateComment = async (params: UpdateCommentParams) => {
      if (typeof props.updateComment !== "function") return;
      try {
        updateCommentStatus.value = "processing";
        await props.updateComment(params);
        params.callback?.();
        updateCommentStatus.value = null;
      } catch (e) {
        updateCommentStatus.value = "error";
      }
    };

    const handleCancelCreateCard = (id: WordCommentInfo["id"]) => {
      underlineService.deleteWord(id);
    };

    const handleFocusCard = (id: WordCommentInfo["id"]) => {
      const data = commentList.value.find((item) => item.id === id);
      emit("focus-card", data);
    };

    onMounted(() => {
      window.addEventListener("mouseup", handleMouseup);
    });

    onUnmounted(() => {
      window.removeEventListener("mouseup", handleMouseup);
    });

    return {
      popoverRef,
      articleRef,
      commentRef,
      handlePopoverClick,
      handleCommentClose,
      handleArticleClick,
      commentList,
      activeId,
      activeRangeInfo,
      localShowComment,
      openComment,
      handleCreateCard,
      handleUpdateActiveId,
      handleDeleteComment,
      hanldeAddComment,
      hanldeUpdateComment,
      handleDeleteCard,
      handleCancelCreateCard,
      getWord: UnderlineService.getWord,
      getWordElements: UnderlineService.getWordElements,
      highlightWords,
      handleFocusCard,
      myRelatedComments,
      commentFilterType,
    };
  },
});
</script>

<style lang="scss" scoped>
.expand-comment-btn {
  position: fixed;
  right: 0;
  margin-left: 9px;
  height: 24px;
  line-height: 24px;
  padding-left: 5px;
  padding-right: 6px;
  background: #fff;
  border: 1px solid #e3e4e6;
  border-right: none;
  border-radius: 6px 0 0 6px;
  cursor: pointer;
  font-size: 20px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  z-index: 2000;
}

.popover-button {
  position: fixed;
  z-index: 9999;
  background-color: #fff;
  display: none;
}

.word-comment-filter-menu {
  .filter-menu-item {
    padding-top: 8px;
    padding-bottom: 8px;
    display: flex;
    align-items: center;
  }
  .filter-menu-item-left {
    flex: 1;
  }
  .filter-menu-item-main {
    line-height: 24px;
  }
  .filter-menu-item-desc {
    line-height: 24px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
    margin-top: 4px;
  }
  .filter-menu-item-check {
    font-size: 16px;
    color: rgb(22, 111, 247);
  }
}

// 定义过度期间的样式
.word-comment-slide-fade-enter-active,
.word-comment-slide-fade-leave-active {
  transition: transform 0.3s ease;
}
// 定义元素进入之前、离开后的样式
.word-comment-slide-fade-enter,
.word-comment-slide-fade-leave-to {
  transform: translateX(100%);
}
</style>

<style lang="scss">
.word-comment-container {
  display: flex;
  height: 100vh;
  .article {
    flex: 1;
    padding: 12px;
    height: 100%;
    overflow: auto;

    & .word {
      border-bottom: 2px solid rgba(255, 209, 0, 0.6);
      padding-bottom: 1px;
    }
    & .word.active {
      background-color: rgba(255, 209, 0, 0.25);
    }
  }

  .comment {
    box-sizing: content-box;
    width: 300px;
    height: 100%;
    border-left: 1px solid rgba(32, 32, 32, 0.15);
    margin-left: 10px;
    .comment-header {
      height: 44px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      .title {
        font-weight: 500;
        font-family: PingFangSC-Medium;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
        line-height: 24px;
      }
      .operation {
        margin-left: auto;
      }
    }
    .comment-content {
      height: calc(100% - 44px);
      overflow: auto;
      padding-bottom: 12px;
    }
  }
}

.m-left-12 {
  margin-left: 12px;
}

.comment-editor-wrapper {
  padding: 12px;
  .editor {
    width: 100%;
  }
  .operation {
    margin-top: 4px;
    text-align: right;
    display: flex;
    align-items: center;
    &-left,
    &-right {
      display: flex;
    }
    &-left {
      flex: 1;
    }
  }
}
</style>
