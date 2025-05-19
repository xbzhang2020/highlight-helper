/**
 * 时间转换
 */
export const formatTime = (time: string) => {
  // 拿到当前的时间戳（毫秒) -- 转换为秒
  let currentTime = new Date();
  let currentTimestamp = parseInt(String(currentTime.getTime() / 1000));

  // 传进来的时间戳（毫秒)
  let t = new Date(time);
  let oldTimestamp = parseInt(String(t.getTime() / 1000));

  // 年
  let oldY = t.getFullYear();
  // 月
  let oldM = t.getMonth() + 1;
  // 日
  let oldD = t.getDate();
  // 时
  let oldH = t.getHours();
  // 分
  let oldi = t.getMinutes();
  // 秒
  let olds = t.getSeconds();

  // 相隔多少秒
  let timestampDiff = currentTimestamp - oldTimestamp;

  if (timestampDiff < 60) {
    // 一分钟以内
    return "刚刚";
  }

  if (timestampDiff < 60 * 60) {
    // 一小时以内
    return Math.floor(timestampDiff / 60) + "分钟前";
  }

  // 今天的时间
  if (oldY === currentTime.getFullYear() && oldM === currentTime.getMonth() + 1 && oldD === currentTime.getDate()) {
    // 10:22
    return `${zeroize(oldH)}:${zeroize(oldi)}`;
  }

  // 今年的时间
  if (oldY === currentTime.getFullYear()) {
    // 12-12 10:22
    return `${zeroize(oldM)}-${zeroize(oldD)} ${zeroize(oldH)}:${zeroize(oldi)}`;
  }

  // 剩下的数据
  // 2023-12-12 10:22
  return `${oldY}-${zeroize(oldM)}-${zeroize(oldD)} ${zeroize(oldH)}:${zeroize(oldi)}`;

  // 补0
  function zeroize(num: number) {
    return num < 10 ? "0" + num : num;
  }
};


export function hasOnlyLinefeed(value: string) {
  return /^(\s*)\n+(\s*)$/.test(value);
}

export function insertAfter(newnode: Element, node: Element) {
  const parent = node.parentNode;
  if (parent.lastChild === node) {
    parent.appendChild(newnode);
  } else {
    parent.insertBefore(newnode, node.nextSibling);
  }
}
