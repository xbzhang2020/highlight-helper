import SCWeb from "@mtfe/sc-web";
import type { UserInfo } from "../../types/word-comment.d";

export class UserService {
  static async getSearchUserList(value: string) {
    const sc = SCWeb({
      componentId: "mis-search", // 组件id用于后续组件粒度的通信权限控制，无此需求可选填
      accessEnv: "production", // 访问环境，必须，可选值： production,staging,test,development
      loginImmediately: false,
      netEnv: "out", // 支持外网环境
    });

    // 目前仅支持mis号搜索
    const res = await sc.fetch({
      url: "/service/user/searchUserList",
      method: "GET",
      params: {
        keyword: value,
      },
    });

    const data = res.data.data || [];
    return data.map((item) => ({
      ...item,
      imageUrl: item.image,
    })) as UserInfo[];
  }

  static async getUserInfos(value: string[]) {
    const sc = SCWeb({
      componentId: "avatar", // 组件id用于后续组件粒度的通信权限控制，无此需求可选填
      accessEnv: "production", // 访问环境，必须，可选值： production,staging,test,development
      loginImmediately: false,
      netEnv: "out", // 支持外网环境
    });

    const res = await sc.fetch({
      url: "/service/user/getUserInfos",
      method: "GET",
      params: {
        mis: value.join(","),
      },
    });
    const data = res.data.data || [];
    return data.map((item) => ({
      ...item,
      misId: item.mis,
      imageUrl: item.url,
      userName: item.name,
    })) as UserInfo[];
  }
}
