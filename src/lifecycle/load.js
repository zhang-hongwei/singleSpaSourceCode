import { flattenFnArray } from "./lifecycle.helpers";
import { LOADING_SOURCE_CODE, NOT_BOOTSTRAPPED } from "../applications/app.helpers"
export async function toLoadPromise(app) {


    if (app.loadPromise) {
        return app.loadPromise
    }

    return app.loadPromise = Promise.resolve().then(async () => {
        app.status = LOADING_SOURCE_CODE;
        let { bootstrap, mount, unmount } = await app.loadApp(app.customProps)
        app.status = NOT_BOOTSTRAPPED; // 没有调用bootstrap 方法
        app.bootstrap = flattenFnArray(bootstrap);
        app.mount = flattenFnArray(mount);
        app.unmount = flattenFnArray(unmount);
        delete app.loadPromise;
        return app
    })

}

