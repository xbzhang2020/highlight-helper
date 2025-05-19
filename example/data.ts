import type { WordCommentInfo } from '../types/index'

export const getCommentList = () => {
  return {
    code: 1,
    data: [
      {
        endIndex: 21,
        divId: "p0",
        content: "，编辑跟我",
        startIndex: 16,
        id: '1',
        comments: [
          {
            id: 0,
            comment: "我是评论内容",
          },
          {
            id: 22,
            comment: "我是评论内容 +1",
          },
        ],
      },
      {
        endIndex: 50,
        divId: "p0",
        content: "4000 册",
        startIndex: 44,
        id: '2',
        comments: [
          {
            id: 1,
            comment: "群众的眼睛是雪亮的",
          },
        ],
      },
      {
        endIndex: 53,
        divId: "p0",
        content: "毕竟首印有 4000 册呢，",
        startIndex: 39,
        id: '3',
        comments: [
          {
            id: 2,
            comment: "感谢大家",
          },
          {
            id: 33,
            comment: "据说销量已经破万了",
          },
        ],
      },
      {
        endIndex: 83,
        divId: "p1",
        content: "太便宜心里有负担",
        startIndex: 75,
        id: '4',
        comments: [
          {
            id: 2,
            comment: "通用的哈~\n            由于git",
          },
        ],
      },
    ] as WordCommentInfo[],
  };
};
