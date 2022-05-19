export function flattenFnArray(fns) {

    fns = Array.isArray(fns) ? fns : [fns]

    return function (props) {
        return fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
    }
}