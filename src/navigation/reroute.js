import { getAppChanges } from "../applications/app";
import { LOADING_SOURCE_CODE } from "../applications/app.helpers";
import { toBootstrapPromise } from "../lifecycle/bootstrap";
import { toLoadPromise } from "../lifecycle/load";
import { toMountPromise } from "../lifecycle/mount";
import { toUnmountPromise } from "../lifecycle/unmount";
import { isStarted } from "../start";


// 核心应用处理方法
export function reroute() {

    // 需要获取要加载的应用
    // 需要获取要被挂载的应用
    // 哪些应用需要被卸载

    const { appsToLoad, appsToMount, appsToUnload, appsToUnmount } = getAppChanges()

    // console.log('====>', appsToLoad, appsToMount, appsToUnload, appsToUnmount);
    // start 方法调用时候是同步的， 但是加载流程是异步的
    if (isStarted()) {
        // start() 
        // console.log(`%c======>${'调用start'}`, 'color: red;');
        return performAppChanges() // 根据路径装载应用
    } else {
        // registerApplication
        // console.log(`%c======>${'调用registerApplication'}`, 'color: red;');
        return loadApps() // 预先加载应用
    }


    async function loadApps() {
        // 预先加载应用  就是将子应用加载到window上
        let apps = await Promise.all(appsToLoad.map(toLoadPromise)) // 就是获取到bootstrap, mount unmount 方法放到APP上

    }


    async function performAppChanges() {
        // 根据路径装载应用
        // 1. 先卸载不需要的应用
        let unmountPromises = appsToUnmount.map(toUnmountPromise)
        // 2. 再加载需要的应用
        // 这个应用可能需要加载， 但是路径不匹配  加载app1的hi后，这个时候切换到了app2

        appsToLoad.map(async (app) => {
            // 将需要加载的应用拿到， 加载， 启动， 挂载
            app = await toLoadPromise(app)
            app = await toBootstrapPromise(app)
            return toMountPromise(app)
        })
        appsToMount.map(async (app) => {
            app = await toBootstrapPromise(app)
            return toMountPromise(app)
        })
    }
}

