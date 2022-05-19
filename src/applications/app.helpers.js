// import { handleAppError } from "./app-errors.js";

// App statuses
export const NOT_LOADED = "NOT_LOADED";   // 应用初始状态
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载资源
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 还没有调用bootstrap方法
export const BOOTSTRAPPING = "BOOTSTRAPPING"; // bootstrap方法调用中
export const NOT_MOUNTED = "NOT_MOUNTED"; // 还没有调用mount方法
export const MOUNTING = "MOUNTING"; // mount方法调用中
export const MOUNTED = "MOUNTED";  // 已经调用mount方法
export const UPDATING = "UPDATING"; // 更新中
export const UNMOUNTING = "UNMOUNTING"; // 接触挂在
export const UNLOADING = "UNLOADING"; // 完全卸载中
export const LOAD_ERROR = "LOAD_ERROR"; // 加载错误
export const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"; // 卸载中

// 当前应用是否被激活
export function isActive(app) {
  return app.status === MOUNTED;
}

// 当前这个应用是否要被激活
export function shouldBeActive(app) {
  try {
    // 如果返回true， 那么应用应该就开始初始化等一些列操作
    return app.activeWhen(window.location)
  } catch (error) {
    console.log("error======>>>", error)
    return false
  }

}