<template>
  <div class="avatar flex flex-all-center">
    <div v-if="imageUrl">
      <img :src="imageUrl" :alt="misId" />
    </div>
    <span v-else>{{ misId }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";

export default defineComponent({
  props: {
    misId: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "https://s3plus.sankuai.com/v1/mss_c967219e66d442fc9cef1b3dfa9accfa/material-static/error.png",
    },
    size: {
      type: Number,
      default: 24,
    },
    isConclusion: {
      type: Boolean,
      default: false,
    },
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  word-break: break-all;
  img {
    width: 28px;
    height: 28px;
    border-radius: 16px;
    margin: 0 8px 0 0;
    background-color: #d3d3d3;
  }
}
</style>
