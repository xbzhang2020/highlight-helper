<template>
  <div class="article-wrapper">
    <div class="content" data-div-id="p0">
      <span>Vue 是一个框架</span>
      ，也是一个生态。其功能覆盖了大部分前端开发常见的需求。但 Web 世界是十分多样化的，不同的开发者在 Web
      上构建的东西可能在形式和规模上会有很大的不同。考虑到这一点，Vue
      的设计非常注重灵活性和“可以被逐步集成”这个特点。根据你的需求场景，你可以用不同的方式使用 Vue：
      <ul>
        <li>无需构建步骤，渐进式增强静态的 HTML</li>
        <li>在任何页面中作为 Web Components 嵌入</li>
        <li>单页应用 (SPA)</li>
        <li>全栈 / 服务端渲染 (SSR)</li>
        <li>Jamstack / 静态站点生成 (SSG)</li>
        <li>开发桌面端、移动端、WebGL，甚至是命令行终端中的界面</li>
      </ul>
    </div>

    <div class="content" data-div-id="p1">
      <mtd-table :data="tableData">
        <mtd-table-column prop="date" label="日期" width="180" />
        <mtd-table-column prop="name" label="姓名" width="180" />
        <mtd-table-column prop="address" label="地址" />
      </mtd-table>
    </div>

    <div class="content" data-div-id="p3">
      <p>目标：支持交易系统平台（TSP）存量业务增长</p>
      <p>评估逻辑：</p>
      <p>TSP主要业务有：外卖+闪购+医药和拼好饭，商分给出的2024年预测订单量增长率为16.7%，存量业务预算需同步增加；</p>
      <p>存量业务预算按订单自然增长预估：2024年存量业务日均资源预算 = 2023年日均成本 * (1 + 商分订单增长率）；</p>
      <p>
        然后参考商分给出的2024年各月订单量，按季度进行拆分，2024年各季度日均资源预算 = 【2024年存量业务日均资源预算】*
        2024年各季度预测单量/2024年季度平均预测单量；
      </p>
      <p>
        预算后台是12月同比增长率，而此次预算评估是按全年成本增长评估，再拆分至各个季度，受去年基数和季度差异影响，12月同比增长不为16.7%；
      </p>
    </div>

    <!-- <div class="content" data-div-id="p4" :data-content="richText">
      <div v-html="richText"></div>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  setup() {
    const tableData = ref([
      {
        date: "2016-05-03",
        name: "美小团",
        province: "北京",
        city: "朝阳区",
        address: "北京市朝阳区望京东路四号",
        zip: 200333,
        tag: "家",
      },
      {
        date: "2016-05-02",
        name: "美小团",
        province: "北京",
        city: "朝阳区",
        address: "北京市朝阳区望京东路四号",
        zip: 200333,
        tag: "公司",
      },
      {
        date: "2016-05-04",
        name: "美小团",
        province: "北京",
        city: "朝阳区",
        address: "北京市朝阳区望京东路四号",
        zip: 200333,
        tag: "家",
      },
      {
        date: "2016-05-01",
        name: "美小团",
        province: "北京",
        city: "朝阳区",
        address: "北京市朝阳区望京东路四号",
        zip: 200333,
        tag: "公司",
      },
    ]);

    const richText = `<p><span>Vue 是一个框架</span>
      ，也是一个生态。其功能覆盖了大部分前端开发常见的需求。但 Web 世界是十分多样化的，不同的开发者在 Web
      上构建的东西可能在形式和规模上会有很大的不同</p>`;

    return { tableData, richText };
  },
});
</script>

<style lang="scss"></style>
