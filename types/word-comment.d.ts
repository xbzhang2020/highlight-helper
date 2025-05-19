import Vue from "vue";

export class CommentEditor extends Vue {
  getText: () => string;
  focus: () => void;
  insertMention: Function;
  getMentionList: Function;
  insertText: Function;
}

export type GetWordContainerId = (continer: HTMLElement) => WordInfo["divId"];
export type GetWordContainer = (id: WordInfo["divId"]) => HTMLElement | NodeListOf<HTMLElement>;

export class WordCommentContainer extends Vue {
  // 组件注册
  static install(
    vue: any,
    options: {
      commentEditor: any;
    },
  ): void;

  showComment: boolean;
  dataSource: WordCommentInfo[];

  getWordContainerId: GetWordContainerId;
  getWordContainer: GetWordContainer;
  getWord: Function;
  getWordElements: Function;

  createWord: Function;
  deleteWord: Function;
  deleteComment: Function;
  addComment: Function;
  updateComment: Function;
  userInfo: UserInfo;

  startPoll: (time: number) => void;
  stopPoll: () => void;

  highlightWords: () => void;
}

export type WordCommentInfo = WordInfo & {
  comments: CommentVo[];
};

export type WordInfo = {
  divId: string; // 段落的id
  startIndex: number;
  endIndex: number;
  id: number | string;
  content: string;
  pageId?: string;
  context?: string; // 划词的上下文信息
  status?: "created" | "mismatched" | "deleted"; // 划词的状态
};

export type MismatchedWordInfo = WordInfo & {
  newContext: string; // 新的划词上下文信息
};

export interface CommentVo {
  createdBy?: string;
  comment?: string;
  createTime?: string;
  id?: number;
  mentioned?: string[];

  /**  是不是可用的评论 */
  isValid?: boolean;
  /**  父评论Id */
  parentCommentId?: number;
  /**  父评论人 */
  parentCommenter?: string;
  /**  父评论中文名 */
  parentCommenterName?: string;
  /**  子评论 */
  subComments?: CommentVo[];
  /**  评论标题（单元格名称） */
  title?: string;
}

export type UpdateCommentParams = {
  id: WordCommentInfo["id"];
  comment: CommentVo;
  callback?: Function;
};

export interface UserInfo {
  imageUrl?: string;
  misId?: string;
  department?: string;
  orgNamePath?: string;
  userName?: string;
}

export type DeleteCommentParams = UpdateCommentParams;
export type AddCommentParams = UpdateCommentParams;

export type ActionStatus = "waiting" | "processing" | "finish" | "error" | null;
export type WordCommentFilterType = "all" | "related";
