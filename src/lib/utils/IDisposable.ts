
export interface IDisposable {
  dispose(): void
}

/**
 * IDisposable のスコープを作成
 * @param resource use が終わるとき (action の処理後) に dispose() が呼ばれます
 * @param action resource !== undefined のときに呼ばれる処理 (引数は resource)
 * @param actionIfNull resource === undefined のときに呼ばれる処理
 */
export function use<T extends IDisposable>(resource: T | undefined,
   action: (r: T) => void,
   actionIfNull?: () => void): void {
  try {
    if (resource !== undefined) {
      action(resource)
    } else if (actionIfNull !== undefined) {
      actionIfNull()
    }
  } finally {
    resource?.dispose()
  }
}

export async function useAsync<T extends IDisposable>(resource: T | undefined,
  action: (r: T) => Promise<void>,
  actionIfNull?: () => Promise<void>): Promise<void> {
  try {
    if (resource !== undefined) {
      await action(resource)
    } else if (actionIfNull !== undefined) {
      await actionIfNull()
    }
  } finally {
    resource?.dispose()
  }
}

// 以下、値を返す版 （kotlinのuse() 的に使いたかったので）
// 当初、use()/userAsync() を変更しようとしましたが、
// resource == undefined && actionIfNull==undefined の場合に、戻り値型が、 R|undefined になってしまって使いにくく、
// ここを弄ると関数の挙動が代わってしまうので、新しい関数を追加することにしました。

/**
 * actionの戻り値を返す IDisposable のスコープを作成
 *
 * @param resource use が終わるとき (action の処理後) に dispose() が呼ばれます
 * @param action resource !== undefined のときに呼ばれる処理 (引数は resource)
 * @param actionIfNull  resource === undefined のときに呼ばれる処理
 *                      resourceがnullにならないことが確実なら不要。!resource && !actionIfNull)の場合は例外をスローする。
 */
export function use2<T extends IDisposable, R>(
    resource: T | undefined,
    action: (r: T) => R,
    actionIfNull?: () => R): R {
  try {
    if (resource !== undefined) {
      return action(resource)
    } else if (actionIfNull !== undefined) {
      return actionIfNull()
    } else {
      throw new Error("resource is null")
    }
  } finally {
    resource?.dispose()
  }
}

/**
 * actionの戻り値を返す IDisposable のスコープを作成（async版）
 *
 * @param resource use が終わるとき (action の処理後) に dispose() が呼ばれます
 * @param action resource !== undefined のときに呼ばれる処理 (引数は resource)
 * @param actionIfNull  resource === undefined のときに呼ばれる処理
 *                      resourceがnullにならないことが確実なら不要。!resource && !actionIfNull)の場合は例外をスローする。
 */
export async function use2Async<T extends IDisposable, R>(
    resource: T | undefined,
    action: (r: T) => Promise<R>,
    actionIfNull?: () => Promise<R>): Promise<R> {
  try {
    if (resource !== undefined) {
      return await action(resource)
    } else if (actionIfNull !== undefined) {
      return await actionIfNull()
    } else {
      throw new Error("resource is null")
    }
  } finally {
    resource?.dispose()
  }
}
