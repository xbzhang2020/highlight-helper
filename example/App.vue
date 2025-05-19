<template>
  <div>
    <WordCommentContainer
      ref="containerRef"
      :userInfo="userInfo"
      :dataSource="wordCommentList"
      :getWordContainer="getWordContainer"
      :getWordContainerId="getWordContainerId"
      :createWord="createWord"
      :deleteWord="deleteWord"
      :deleteComment="deleteComment"
      :addComment="addComment"
      :updateComment="updateComment"
    >
      <template #article>
        <Article />
      </template>
      <template #popover>
        <mtd-icon-button class="popover-icon-btn" type="secondary" icon="mtdicon mtdicon-comment" />
      </template>
    </WordCommentContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "@vue/composition-api";
import Article from "./components/Article.vue";
import type {
  WordCommentInfo,
  DeleteCommentParams,
  UpdateCommentParams,
  AddCommentParams,
  WordInfo,
  CommentVo,
} from "../types/index";

const key = "word-comment";

function createId() {
  return new Date().getTime();
}

async function getWordList() {
  const data: WordCommentInfo[] = JSON.parse(localStorage.getItem(key)) || [];
  return data;
}

const getWordContainerId = (container: HTMLElement) => container.dataset.divId;
const getWordContainer = (id: WordInfo["divId"]) => document.querySelector('[data-div-id="' + id + '"]');

export default defineComponent({
  name: "App",
  components: {
    Article,
  },
  setup() {
    const userInfo = {
      misId: "zhangxingbin",
      userName: "张兴斌",
    };

    const containerRef = ref(null);
    const wordCommentList = ref<WordCommentInfo[]>([]);

    let timer = null;
    let finished = null;
    let lastFetchTime = null; // 上一次请求的时间
    let intervalTime = null; // 每次请求的时间间隔

    function poll(fn: Function, interval: number) {
      // 清除上一个定时器
      if (timer) {
        clearTimeout(timer);
      }

      // 设置新的定时器
      timer = setTimeout(async function () {
        try {
          // 执行请求
          await fn();
        } catch (error) {
          console.error(error);
        } finally {
          // 结束轮询
          if (finished) {
            timer = null;
            return;
          }
          // 递归调用，实现轮询
          poll(fn, interval);
        }
      }, interval);
    }

    function startPoll(interval = 5000) {
      finished = null;
      intervalTime = interval;
      poll(updateWordList, interval);
    }

    function stopPoll() {
      finished = true;
    }

    // 获取划词评论列表
    async function updateWordList(immdeiate = false) {
      // console.log("fetch");
      // 轮询时，未到间隔时间，直接返回
      // if (!immdeiate && lastFetchTime && intervalTime && new Date().getTime() - lastFetchTime < intervalTime) return;
      // console.log("poll fetch");
      wordCommentList.value = await getWordList();
      // console.log('change', wordCommentList.value)
      // lastFetchTime = new Date().getTime();
    }

    async function addComment(parmas: AddCommentParams) {
      const originData = await getWordList();
      const item = originData.find((item) => item.id === parmas.id);
      if (!item) return;

      item.comments.push({
        createdBy: "zhangxingbin",
        comment: parmas.comment.comment,
        createTime: "2021-10-01 10:00:00",
        id: Math.random(),
        mentioned: parmas.comment.mentioned || [],
      });

      localStorage.setItem(key, JSON.stringify(originData));
      await updateWordList(true);
    }

    async function deleteComment(params: DeleteCommentParams) {
      const { id, comment } = params;
      const originData = await getWordList();
      const index = originData.findIndex((item) => item.id === id);
      if (index === -1) return;

      const item = originData[index];
      const commentIndex = item.comments.findIndex((item) => item.id === comment.id);
      if (commentIndex === -1) return;

      item.comments.splice(commentIndex, 1);
      localStorage.setItem(key, JSON.stringify(originData));
      updateWordList(true);
    }

    async function updateComment(params: UpdateCommentParams) {
      const { id, comment } = params;
      const originData = await getWordList();
      const index = originData.findIndex((item) => item.id === id);
      if (index === -1) return;

      const item = originData[index];
      const commentIndex = item.comments.findIndex((item) => item.id === comment.id);
      if (commentIndex === -1) return;

      item.comments[commentIndex].comment = comment.comment;
      localStorage.setItem(key, JSON.stringify(originData));
      updateWordList(true);
    }

    async function deleteWord(id: WordCommentInfo["id"]) {
      const originData = await getWordList();
      const index = originData.findIndex((item) => item.id === id);
      if (index === -1) return;
      originData.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(originData));
      updateWordList(true);
    }

    async function createWord(range: WordInfo, comment: CommentVo) {
      const newComment: CommentVo = {
        ...comment,
        id: createId(),
        createdBy: "zhangxingbin",
        createTime: new Date().toLocaleDateString(),
      };
      const item: WordCommentInfo = { ...range, id: createId(), comments: [newComment], status: 'mismatched' };

      const originData = await getWordList();
      const newData = originData.concat(item);
      localStorage.setItem(key, JSON.stringify(newData));
      updateWordList(true);

      // 支持富文本
      // const container = getWordContainer(range.divId) as HTMLElement;
      // const content = container.dataset.content;
      // const wordContainer = document.createElement("div");
      // wordContainer.innerHTML = content;

      // const newRange: WordInfo = {
      //   ...range,
      //   startIndex: -1,
      //   endIndex: -1,
      //   id: createId(),
      // };
      // UnderlineService.highlightWord(newRange, wordContainer);
      // console.log(newRange, wordContainer);
    }

    onMounted(async () => {
      await updateWordList(true);
      startPoll(10000);
    });

    return {
      getWordList,
      createWord,
      deleteComment,
      addComment,
      updateComment,
      deleteWord,
      userInfo,
      containerRef,
      getWordContainer,
      getWordContainerId,
      wordCommentList,
      startPoll,
    };
  },
});
</script>
