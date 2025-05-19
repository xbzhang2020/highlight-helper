import type { WordCommentInfo } from "../../types/word-comment.d";

export class CommentService {
  static getCommentCard(list: WordCommentInfo[], id: WordCommentInfo["id"]) {
    return list.find((item) => item.id === id);
  }

  static getCommenters(dataSource: WordCommentInfo[]) {
    const res: string[] = [];
    dataSource.forEach((item) => {
      item.comments.forEach((comment) => {
        const { createdBy } = comment;
        if (!res.includes(createdBy)) {
          res.push(createdBy);
        }
      });
    });
    return res;
  }
}
