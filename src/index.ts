import Container from "./components/Container.vue";

export const WordCommentContainer = Container;

export default {
  install: (app: any, options: any) => {
    const { commentEditor } = options;
    app.component("comment-editor", commentEditor);
    app.component(WordCommentContainer.name, WordCommentContainer);
  },
};
