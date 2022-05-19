import {
    NOT_LOADED,
    isActive,
    NOT_BOOTSTRAPPED,
    NOT_MOUNTED,
    MOUNTED,
    LOAD_ERROR,
    SKIP_BECAUSE_BROKEN,
    LOADING_SOURCE_CODE,
    shouldBeActive,
} from "./app.helpers"
import { reroute } from "../navigation/reroute.js"
/**
 * 
 * @param {*} appName 应用名称
 * @param {*} loadApp 加载的应用 promise
 * @param {*} activeWhen 什么时候激活
 * @param {*} customProps 自定义属性
 */


const apps = [];
// 维护应用所有的状态， 包括激活状态， 加载状态， 加载完成的状态， 一共12种状态
export function registerApplication(appName, loadApp, activeWhen, customProps) {
    apps.push({
        name: appName,
        loadApp,
        activeWhen,
        customProps,
        status: NOT_LOADED
    })


    reroute() // 加载应用


    console.log(apps)

};


export function getAppChanges() {
    const appsToUnmount = [];
    const appsToLoad = [];
    const appsToMount = [];
    const appsToUnload = []
    const currentTime = new Date().getTime();
    apps.forEach(app => {
        // 检查每个子应用是否需要被加载
        const appShouldBeActive = app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);
        switch (app.status) {
            // case LOAD_ERROR:
            //     if (appShouldBeActive && currentTime - app.loadErrorTime >= 200) {
            //         appsToLoad.push(app)
            //     }
            //     break
            case NOT_LOADED:
            case LOADING_SOURCE_CODE:
                if (appShouldBeActive) {
                    appsToLoad.push(app)
                }
                break;
            case NOT_BOOTSTRAPPED:
            case NOT_MOUNTED:
                if (!appShouldBeActive) {
                    appsToUnload.push(app)
                } else if (appShouldBeActive) {
                    appsToMount.push(app)
                }
                break;
            case MOUNTED:
                if (!appShouldBeActive) {
                    appsToUnmount.push(app)
                }
                break;
        }

    })
    return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };

}