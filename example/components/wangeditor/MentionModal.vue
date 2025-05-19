<template>
  <div class="mention-modal" :style="{ top: rect.top, left: rect.left }">
    <mtd-input
      class="mention-input"
      genre="line"
      v-model="searchVal"
      ref="input"
      @keydown="handleInputKeyup"
      size="small"
      @change="handleInputChange"
    />

    <mtd-dropdown-menu class="mention-list">
      <mtd-dropdown-menu-item v-if="loading">搜索中...</mtd-dropdown-menu-item>
      <mtd-dropdown-menu-item v-else-if="list.length === 0">未搜索到用户</mtd-dropdown-menu-item>
      <template v-else>
        <mtd-dropdown-menu-item
          v-for="(item, index) in list"
          :key="item.misId"
          :class="['mention-list-item', index === selectIndex && 'mention-list-item-selected']"
          @click="handleInsertMention(item.misId, item.userName)"
        >
          <img :src="item.imageUrl" :alt="item.misId" />
          <span>{{ item.userName }}/{{ item.misId }}</span>
        </mtd-dropdown-menu-item>
      </template>
    </mtd-dropdown-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { UserService } from "../../../src/services/user";
import type { UserInfo } from "../../../types/index";

export default defineComponent({
  name: "MentionModal",
  setup(props, { emit }) {
    const rect = ref({
      top: "",
      left: "",
    });

    const searchVal = ref("");
    const list = ref<UserInfo[]>([]);
    const loading = ref(false);
    const selectIndex = ref(0);

    function handleInputKeyup(event: KeyboardEvent) {
      // console.log(event.key);
      // esc - 隐藏 modal
      if (event.key === "Escape") {
        emit("hideMentionModal");
        return;
      }

      // Backspace - 删除 @
      if (event.key === "Backspace" && !searchVal.value) {
        emit("deleteMention");
        emit("hideMentionModal"); // 隐藏 modal
        return;
      }

      if (event.key === " " || event.key === "ArrowRight") {
        emit("insertText", searchVal.value);
        emit("hideMentionModal"); // 隐藏 modal
        return;
      }

      // ArrowDown
      if (event.key === "ArrowDown" && selectIndex.value < list.value.length - 1) {
        selectIndex.value++;
        return;
      }

      // ArrowUp
      if (event.key === "ArrowUp" && selectIndex.value > 0) {
        selectIndex.value--;
        return;
      }

      // enter - 插入 mention node
      if (event.key === "Enter") {
        const item = list.value[selectIndex.value];
        if (item) {
          const { misId, userName } = item;
          handleInsertMention(misId, userName);
        }
      }
    }

    function handleInsertMention(misId: string, userName: string) {
      emit("insertMention", misId, userName);
      emit("hideMentionModal");
    }

    async function handleInputChange(val: string) {
      loading.value = true;
      const res = await UserService.getSearchUserList(val);
      loading.value = false;
      if (res) {
        list.value = res;
        selectIndex.value = 0;
      }
    }

    const input = ref<HTMLElement>(null);

    onMounted(() => {
      // 获取光标位置
      const domSelection = document.getSelection();
      const domRange = domSelection?.getRangeAt(0);
      if (domRange == null) return;
      const _rect = domRange.getBoundingClientRect();

      // 防止弹窗被遮挡
      const offsetRight = document.body.clientWidth - _rect.left;
      const offsetWidth = offsetRight < 150 ? 150 : 0;

      // 定位 modal
      rect.value.top = `${_rect.top - 4}px`;
      rect.value.left = `${_rect.left - offsetWidth}px`;

      // focus input
      input.value.focus();
    });

    return {
      handleInputKeyup,
      handleInsertMention,
      handleInputChange,
      input,
      list,
      rect,
      searchVal,
      loading,
      selectIndex,
    };
  },
});
</script>

<style lang="scss" scoped>
.mention-modal {
  position: fixed;
  background-color: #fff;
  z-index: 1;
}

.mention-input {
  ::v-deep input {
    border: 0 none;
  }
}
.mention-list {
  .mention-list-item img {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin-right: 8px;
    vertical-align: middle;
  }
  .mention-list-item-selected {
    background: rgba(65, 194, 246, 0.1);
  }
}
</style>
