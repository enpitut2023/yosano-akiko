// 学類ごとではなく全体で一度だけ表示する
const KEY = "akiko_tutorial_seen";

/**
 * チュートリアルを既に見たかどうか。localStorage が使えない環境では見たことに
 * して、毎回開いてしまうのを防ぐ。
 */
export function tutorialSeen(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return true;
  }
}

/** チュートリアルを見たことを記録する。失敗しても無視する。 */
export function markTutorialSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // 記録できなくても使用には支障がない
  }
}
