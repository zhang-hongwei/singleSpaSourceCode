(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) {
    'use strict';

    // import { handleAppError } from "./app-errors.js";

    // App statuses
    const NOT_LOADED = "NOT_LOADED";   // 应用初始状态
    const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载资源
    const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 还没有调用bootstrap方法
    const BOOTSTRAPPING = "BOOTSTRAPPING"; // bootstrap方法调用中
    const NOT_MOUNTED = "NOT_MOUNTED"; // 还没有调用mount方法
    const MOUNTING = "MOUNTING"; // mount方法调用中
    const MOUNTED = "MOUNTED";  // 已经调用mount方法
    const UNMOUNTING = "UNMOUNTING"; // 接触挂在
    const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"; // 卸载中

    // 当前这个应用是否要被激活
    function shouldBeActive(app) {
        try {
            // 如果返回true， 那么应用应该就开始初始化等一些列操作
            return app.activeWhen(window.location)
        } catch (error) {
            console.log("error======>>>", error);
            return false
        }

    }

    async function toBootstrapPromise(app) {
        if (app.status !== NOT_BOOTSTRAPPED) {
            return app;
        }

        app.status = BOOTSTRAPPING;
        await app.bootstrap(app.customProps);
        app.status = NOT_MOUNTED;
        return app

        // app.status = NOT_BOOTSTRAPPED;
    }

    function flattenFnArray(fns) {

        fns = Array.isArray(fns) ? fns : [fns];

        return function (props) {
            return fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
        }
    }

    async function toLoadPromise(app) {


        if (app.loadPromise) {
            return app.loadPromise
        }

        return app.loadPromise = Promise.resolve().then(async () => {
            app.status = LOADING_SOURCE_CODE;
            let { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
            app.status = NOT_BOOTSTRAPPED; // 没有调用bootstrap 方法
            app.bootstrap = flattenFnArray(bootstrap);
            app.mount = flattenFnArray(mount);
            app.unmount = flattenFnArray(unmount);
            delete app.loadPromise;
            return app
        })

    }

    async function toMountPromise(app) {
        if (app.status !== NOT_MOUNTED) {
            return app;
        }

        app.status = MOUNTING;
        await app.mount(app.customProps);
        app.status = MOUNTED;
        return app
    }

    async function toUnmountPromise(app) {
        if (app.status != MOUNTED) {
            // 当前应用没有被挂载直接什么都不做
            return app
        }

        app.status = UNMOUNTING;
        await app.unmount(app.customProps);
        app.status = NOT_MOUNTED;
        return app

    }

    let started = false;

    function start() {

        started = true;
        reroute(); // 除了去加载应用还需要去挂载应用
    }
    function isStarted() {
        return started
    }

    // 核心应用处理方法
    function reroute() {

        // 需要获取要加载的应用
        // 需要获取要被挂载的应用
        // 哪些应用需要被卸载

        const { appsToLoad, appsToMount, appsToUnload, appsToUnmount } = getAppChanges();

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
            await Promise.all(appsToLoad.map(toLoadPromise)); // 就是获取到bootstrap, mount unmount 方法放到APP上

        }


        async function performAppChanges() {
            // 根据路径装载应用
            // 1. 先卸载不需要的应用
            appsToUnmount.map(toUnmountPromise);
            // 2. 再加载需要的应用
            // 这个应用可能需要加载， 但是路径不匹配  加载app1的hi后，这个时候切换到了app2

            appsToLoad.map(async (app) => {
                // 将需要加载的应用拿到， 加载， 启动， 挂载
                app = await toLoadPromise(app);
                app = await toBootstrapPromise(app);
                return toMountPromise(app)
            });
            appsToMount.map(async (app) => {
                app = await toBootstrapPromise(app);
                return toMountPromise(app)
            });
        }
    }

    /**
     * 
     * @param {*} appName 应用名称
     * @param {*} loadApp 加载的应用 promise
     * @param {*} activeWhen 什么时候激活
     * @param {*} customProps 自定义属性
     */


    const apps = [];
    // 维护应用所有的状态， 包括激活状态， 加载状态， 加载完成的状态， 一共12种状态
    function registerApplication(appName, loadApp, activeWhen, customProps) {
        apps.push({
            name: appName,
            loadApp,
            activeWhen,
            customProps,
            status: NOT_LOADED
        });

        reroute(); // 加载应用

        //   console.log(apps);

    }

    function getAppChanges() {
        const appsToUnmount = [];
        const appsToLoad = [];
        const appsToMount = [];
        const appsToUnload = [];
        new Date().getTime();
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
                        appsToLoad.push(app);
                    }
                    break;
                case NOT_BOOTSTRAPPED:
                case NOT_MOUNTED:
                    if (!appShouldBeActive) {
                        appsToUnload.push(app);
                    } else if (appShouldBeActive) {
                        appsToMount.push(app);
                    }
                    break;
                case MOUNTED:
                    if (!appShouldBeActive) {
                        appsToUnmount.push(app);
                    }
                    break;
            }

        });
        return { appsToUnload, appsToUnmount, appsToLoad, appsToMount };

    }

    exports.registerApplication = registerApplication;
    exports.start = start;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
