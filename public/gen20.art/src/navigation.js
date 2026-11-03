// /src/navigation.js

export function navigate(path, options = {}) {
    if (!path || typeof path !== "string") return;

    if (options.replace) {
        window.history.replaceState({}, "", path);
    } else {
        window.history.pushState({}, "", path);
    }

    window.dispatchEvent(new PopStateEvent("popstate"));
}

export function goBack() {
    window.history.back();
}

export function goForward() {
    window.history.forward();
}