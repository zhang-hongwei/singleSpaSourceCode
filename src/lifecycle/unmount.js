import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../applications/app.helpers";

export async function toUnmountPromise(app) {
    if (app.status != MOUNTED) {
        // 当前应用没有被挂载直接什么都不做
        return app
    }

    app.status = UNMOUNTING;
    await app.unmount(app.customProps);
    app.status = NOT_MOUNTED
    return app

}