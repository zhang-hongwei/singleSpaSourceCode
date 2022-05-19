import { reroute } from "./navigation/reroute";



let started = false

export function start() {

    started = true;
    reroute() // 除了去加载应用还需要去挂载应用
};

export function isStarted() {
    return started
}