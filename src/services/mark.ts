import { hasOnlyLinefeed, insertAfter } from "../utils/index";

type WordId = number | string;
type CreateMarkOption = {
  debug?: boolean;
  tagName?: string;
};

export default class CreateMark {
  options: CreateMarkOption;

  constructor(options: CreateMarkOption) {
    const o = Object.assign(
      {
        debug: false,
      },
      options,
    );
    this.options = o;
  }

  public create(range: Range, wid: WordId) {
    let newNodeList: HTMLElement[] = [];

    const snode = range.startContainer;
    const enode = range.endContainer;
    if (snode && enode) {
      if (snode === enode || snode.parentNode === enode.parentNode) {
        const newnode = this._createMarkElement(wid);
        range.surroundContents(newnode);
        newNodeList.push(newnode);
      } else {
        const arr = this._surroundCrossContents(range, wid);
        newNodeList = newNodeList.concat(arr);
      }
    } else if (!snode) {
      console.error("range.startContainer does not exist");
    } else if (!enode) {
      console.error("range.endContainer does not exist");
    }

    return newNodeList;
  }

  private _getNewRange(range: Range) {
    const cnode = range.commonAncestorContainer;
    const snode = range.startContainer;
    const enode = range.endContainer;
    let nodeList = [];
    let start = false;
    let end = false;
    function cb(parent: Node) {
      const childNodes = parent.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        if (end) {
          break;
        }
        if (child === snode) {
          start = true;
        }
        if (child === enode) {
          end = true;
        }
        if (child.nodeType === 1) {
          if (child.contains(snode) || child.contains(enode)) {
            cb(child);
          } else if (start) {
            nodeList.push(child);
          }
        } else if (child.nodeType === 3 && !hasOnlyLinefeed(child.nodeValue) && start) {
          nodeList.push(child);
        }
      }
    }
    cb(cnode);
    return {
      nodeList,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    };
  }

  private _surroundCrossContents(range: Range, wid: WordId) {
    const opt = this.options;
    const newRange = this._getNewRange(range); //  获取所有范围内的文本节点
    const nodeList = newRange.nodeList;
    const startOffset = newRange.startOffset;
    const endOffset = newRange.endOffset;
    const length = nodeList.length;
    let newNodeList = [];
    if (opt.debug) {
      console.log(newRange, "newRange");
    }
    nodeList.forEach((node, index) => {
      const pnode = node.parentNode;
      const value = node.nodeValue;
      const newnode = this._createMarkElement(wid);
      if (index === 0) {
        if (node.nodeType === 3) {
          const siblingnode = node.nextSibling;
          newnode.innerText = value.substr(startOffset);
          node.nodeValue = value.substr(0, startOffset);
          if (siblingnode) {
            pnode.insertBefore(newnode, siblingnode);
          } else {
            pnode.appendChild(newnode);
          }
          newNodeList.push(newnode);
        }
      } else if (index === length - 1) {
        if (node.nodeType === 3) {
          const siblingnode = node.previousSibling;
          newnode.innerText = value.substr(0, endOffset);
          node.nodeValue = value.substr(endOffset);
          if (siblingnode) {
            insertAfter(newnode, siblingnode);
          } else {
            pnode.insertBefore(newnode, node);
          }
          newNodeList.push(newnode);
        }
      } else {
        if (node.nodeType === 3) {
          newnode.innerText = value;
          pnode.replaceChild(newnode, node);
        } else {
          newnode.innerHTML = node.innerHTML;
          node.innerHTML = "";
          node.appendChild(newnode);
        }
        newNodeList.push(newnode);
      }
    });
    return newNodeList;
  }

  private _createMarkElement(wid: number | string) {
    const _tagName = this.options.tagName || "mark";
    const node = document.createElement(_tagName);
    node.dataset.wid = wid.toString();
    node.className = "word";
    return node;
  }
}
