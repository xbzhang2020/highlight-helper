import { MentionProvider as BaseMentionProvider } from '@it/parker/es/providers'
import SCWeb from '@mtfe/sc-web'

type UserInfo = {
  department?: string
  image?: string
  jobStatus?: string
  misId?: string
  userId?: string
  userName?: string
}

type MentionUserInfo = { avatar?: string; uid?: string; name?: string }

export class MentionProvider extends BaseMentionProvider {
  userId: string
  name: string
  sc: ReturnType<typeof SCWeb>

  constructor(userId: string, name: string) {
    super()
    this.userId = userId // 当前用户id
    this.name = name // 当前用户名
    this.sc = SCWeb({
      componentId: 'mis-search', // 组件id用于后续组件粒度的通信权限控制，无此需求可选填
      accessEnv: 'production', // 访问环境，必须，可选值： production,staging,test,development
      loginImmediately: false,
      netEnv: 'out', // 支持外网环境
    })
  }

  async fetchUsers(val: string) {
    const res = await this.sc.fetch({
      url: '/service/user/searchUserList',
      method: 'GET',
      params: {
        keyword: val,
      },
    })

    const data: UserInfo[] = res?.data?.data
    if (!data) return []
    const list = data.map(
      item =>
        ({
          avatar: item.image,
          uid: item.misId,
          name: item.userName,
        } as MentionUserInfo)
    )

    return list
  }

  searchUsers = async (name: string, pageNo: number) => {
    const list = await this.fetchUsers(name)

    const res = {
      members: list,
      hasNext: false, // sc 问题，只能查10 页
      pageNo: pageNo + 1,
    }
    return res
  }
}
