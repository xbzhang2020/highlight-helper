import type { WordInfo, GetWordContainer, GetWordContainerId, MismatchedWordInfo } from "../../types/word-comment.d";
import CreateMark from "./mark";

const getDefaultWordContainer = (id: WordInfo["divId"]) =>
  document.querySelector('[data-pid="' + id + '"]') as HTMLElement;

const getDefaultWordContainerId = (container: HTMLElement) => container.dataset.pid;

export class UnderlineService {
  wordContainerSelector = ".content";
  wordSelector = ".word";

  getWordContainer: GetWordContainer = getDefaultWordContainer;
  getWordContainerId: GetWordContainerId = getDefaultWordContainerId;

  static getSelectionRange(container?: HTMLElement) {
    const selection = document.getSelection();
    const selectContent = selection.toString();
    const selectContentTrim = selectContent.trim();

    // 获取range 范围
    const ranges: Range[] = [];
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges[i] = selection.getRangeAt(i);
    }
    const range = ranges[0];
    if (!range) {
      return;
    }

    // 选区范围是否为空
    if (!selectContentTrim) {
      return;
    }

    // 选区范围是否在指定容器内
    if (container && !container.contains(range.commonAncestorContainer)) {
      console.error("超出合法范围的选区");
      return;
    }

    return range;
  }

  // 获取节点在容器内的文本偏移量
  static getNodeStartOffset(container: Element, target: Node) {
    // 起始位置的计算
    let startIndex = 0;
    const loopIndex = (dom: Node) => {
      const nodes = [...dom.childNodes];
      return nodes.some((node) => {
        // 忽略起始位置的空格
        if (!node.textContent.trim()) return;

        // 找到匹配节点，不再匹配
        if (node == target) {
          return true;
        }

        // 匹配节点在当前节点的内部，进行遍历
        if (node.contains(target)) {
          return loopIndex(node);
        }

        // 累加匹配节点之前的文本长度
        startIndex += node.textContent.length;
      });
    };
    const success = loopIndex(container);
    return success ? startIndex : null;
  }

  static getContainerText(container: Element) {
    const texts = UnderlineService.getTextNodes(container);
    return texts.map((text) => text.textContent).join("");
  }

  getSelectionWordInfo() {
    const selection = document.getSelection();
    const range = selection.getRangeAt(0);
    const { startContainer, startOffset, endContainer, endOffset } = range;

    const container = startContainer.parentElement.closest(this.wordContainerSelector) as HTMLElement;
    if (!container) {
      console.error("不支持的选区");
      return;
    }

    const startNodeOffset = UnderlineService.getNodeStartOffset(container, startContainer);
    const endNodeOffset = UnderlineService.getNodeStartOffset(container, endContainer);
    if (startNodeOffset === null) return;

    const context = UnderlineService.getContainerText(container); // 容器的上下文信息
    const content = selection.toString().trim(); // 划词内容信息
    const startIndex = startNodeOffset + startOffset; // 划词开始位置在容器中的偏移量
    const endIndex = endNodeOffset + endOffset; // 划词结束位置在容器中的偏移量，考虑到换行符，值不能直接等于 startIndex + content.length
    const divId = this.getWordContainerId(container); // 容器的id

    return {
      divId,
      startIndex,
      endIndex,
      content,
      context,
    } as WordInfo;
  }

  static hasWord(range: WordInfo, data: WordInfo[]) {
    return data.find((item) =>
      Object.keys(range)
        .filter((key) => ["divId", "startIndex", "endIndex", "content"].includes(key))
        .every((key) => item[key] === range[key]),
    );
  }

  static highlightRange(range: Range, id: WordInfo["id"]) {
    // 实现方法一：surroundContents方法 不能跨标签
    // const mark = document.createElement("span");
    // mark.dataset.wid = id.toString();
    // mark.className = "word";
    // try {
    //   range.surroundContents(mark);
    //   return mark;
    // } catch (e) {
    //   console.error("选区不支持交叉覆盖");
    //   return;
    // }

    // 实现方法二：extractContents方法可以跨标签，但样式可能会错乱
    // const mark = document.createElement("span");
    // mark.dataset.wid = id.toString();
    // mark.className = "word";
    // mark.append(range.extractContents());
    // range.insertNode(mark);
    // return mark;

    // 实现方法三：跨选区
    const mark = new CreateMark({
      tagName: "span",
    });
    return mark.create(range, id);
  }

  static highlightSelectionWord() {
    const selection = document.getSelection();
    const range = selection.getRangeAt(0);
    const wid = `temp-${new Date().getTime()}`;
    UnderlineService.highlightRange(range, wid);
    return wid;
  }

  static getTextNodes(target: Element) {
    const arrTextList: Node[] = [];
    const map = (chlids: NodeListOf<ChildNode>) => {
      const nodes = [...chlids];
      nodes.forEach((el) => {
        if (el.nodeName === "#text") {
          arrTextList.push(el);
        } else if (el.textContent) {
          map(el.childNodes);
        }
      });
    };
    map(target.childNodes);
    return arrTextList;
  }

  static getNodeRangeInfo(target: Element, start = 0, end = 0) {
    // 获取所有的文本节点
    const arrTextList = UnderlineService.getTextNodes(target);

    let startNode = null;
    let startIndex = 0;
    let endNode = null;
    let endIndex = 0;
    let total = startIndex;

    // 计算文本长度
    arrTextList.forEach((node) => {
      if (startNode && endNode) {
        return;
      }
      const length = node.textContent.length;
      const range = [total, total + length];

      if (!startNode && start >= range[0] && start < range[1]) {
        startNode = node;
        startIndex = start - total;
      }

      if (!endNode && end > range[0] && end <= range[1]) {
        endNode = node;
        endIndex = end - range[0];
      }
      total = total + length;
    });

    if (!startNode || !endNode) {
      return null;
    }

    return {
      startContainer: startNode,
      startOffset: startIndex,
      endContainer: endNode,
      endOffset: endIndex,
    };
  }

  /**
   * 高亮划词
   */
  static highlightWord(obj: WordInfo, container: HTMLElement) {
    // 获取划词区域的节点信息
    const node = UnderlineService.getNodeRangeInfo(container, obj.startIndex, obj.endIndex);
    if (!node) return;

    // 创建划词范围
    const range = document.createRange();
    range.setStart(node.startContainer, node.startOffset);
    range.setEnd(node.endContainer, node.endOffset);

    UnderlineService.highlightRange(range, obj.id);
  }

  /**
   * 高亮划词区域
   * @param data
   */
  highlightWords(data: WordInfo[]) {
    const mismatchedWords: MismatchedWordInfo[] = [];

    data.forEach((obj) => {
      // 获取划词所在的容器
      const container = this.getWordContainer(obj.divId);
      if (!container) return;
      const nodes = container instanceof NodeList ? [...container] : [container];
      if (!nodes.length) return;

      // 出现不匹配的划词容器增加标识
      if (obj.status === "mismatched") {
        nodes.forEach((node) => node.classList.add("word-mismatched"));
        return;
      }

      // 划词是否匹配
      const containerText = UnderlineService.getContainerText(nodes[0]);
      // 没有内容，可能是异步加载内容，接口没有渲染完
      if (!containerText) return;

      if (obj.context && containerText !== obj.context) {
        mismatchedWords.push({
          ...obj,
          newContext: containerText,
        });
        return;
      }

      nodes.forEach((containerItem) => {
        // 段落内是否已存在划词区域
        const section = UnderlineService.getWordElements(obj.id, containerItem);
        if (section.length) return;

        UnderlineService.highlightWord(obj, containerItem);
      });
    });
    return mismatchedWords;
  }

  /**
   * 取消高亮划词
   * @param data
   */
  unhighlightWords(data: WordInfo[]) {
    data.forEach((obj) => {
      const container = this.getWordContainer(obj.divId);
      if (!container) return;

      const nodes = container instanceof NodeList ? [...container] : [container];
      nodes.forEach((node) => {
        // 获取容器内所有的划词
        const wordNodes = UnderlineService.getWordElements(obj.id, node);
        wordNodes.forEach((section) => {
          // 将一个元素的所有子元素插入其父元素中，并移除该元素
          while (section.firstChild) {
            section.parentNode.insertBefore(section.firstChild, section);
          }
          section.parentNode.removeChild(section);
        });
      });
    });
  }

  deactivateWord() {
    const words = document.body.querySelectorAll(this.wordSelector);
    words.forEach((node) => {
      node.classList.remove("active");
    });

    const containers = document.body.querySelectorAll(this.wordContainerSelector);
    containers.forEach((node) => {
      node.classList.remove("active");
    });
  }

  activateWord(data: WordInfo) {
    const id = data?.id;
    if (!id) return;

    // 去除之前的高亮划词
    this.deactivateWord();

    // 如果划词存在，高亮当前划词
    const list = UnderlineService.getWordElements(id);
    if (list.length) {
      list.forEach((node) => {
        node.classList.add("active");
      });
      return;
    }

    // 如果划词不存在，高亮划词所在的容器
    const container = this.getWordContainer(data.divId);
    const nodes = container instanceof NodeList ? [...container] : [container];
    nodes.forEach((node) => {
      node.classList.add("active");
    });
  }

  deleteWord(id: WordInfo["id"]) {
    const list = UnderlineService.getWordElements(id);
    list.forEach((item) => {
      const node = item as HTMLElement;
      node.classList.remove("word");
      node.dataset.wid = undefined;
    });
  }

  static isActiveWord(target: HTMLElement) {
    if (target && target.classList.contains("active")) return true;
    return false;
  }

  static isTempWordId(id: WordInfo["id"]) {
    return id?.toString().startsWith("temp-");
  }

  static getWordId(target: HTMLElement): WordInfo["id"] {
    const id = target.dataset.wid;
    return isNaN(Number(id)) ? id : Number(id); // 优先是数字类型
  }

  static getWord(id: number | string, container?: HTMLElement): HTMLElement {
    const selector = `.word[data-wid="${id}"]`;
    if (container) {
      return container.querySelector(selector);
    }
    return document.querySelector(selector);
  }

  static getWordElements(id: WordInfo["id"], container?: HTMLElement) {
    const selector = `.word[data-wid="${id}"]`;
    const _container = container || document;
    return _container.querySelectorAll(selector);
  }

  static replaceWordId(id: WordInfo["id"], newId: WordInfo["id"]) {
    const list = UnderlineService.getWordElements(id);
    list.forEach((item) => {
      const node = item as HTMLElement;
      node.dataset.wid = newId.toString();
    });
  }

  static getClosetWordElement(target: HTMLElement): HTMLElement {
    return target?.closest(".word");
  }
}
