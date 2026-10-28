const KEY = "akiko_pan_hint_seen";

/**
 * 表をドラッグで動かせることを既に知っているかどうか。localStorage が使えない
 * 環境では知っていることにして、ヒントを出し続けないようにする。
 */
export function panHintSeen(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true;
  }
}

/** 表をドラッグで動かしたことを記録する。失敗しても無視する。 */
export function markPanHintSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // 記録できなくても使用には支障がない
  }
}
