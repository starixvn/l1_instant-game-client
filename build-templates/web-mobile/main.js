window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;

    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
    const deviceSize = cc.view.getFrameSize();

    function updateDPR(designWidth, designHeight) {
        // dpr tells the browser how many of the screen's actual pixels should be used to draw a single CSS pixel.
        if (window.devicePixelRatio) {
            const deviceSize = cc.view.getFrameSize();
            const windowDPR = window.devicePixelRatio || 1;
            const scale = Math.max(designWidth / deviceSize.width, designHeight / deviceSize.height);
            const newDPR = windowDPR * scale;
            const minDPR = 1.5;
            const maxDPR = 2;
            window.devicePixelRatio = newDPR > maxDPR ? maxDPR : newDPR < minDPR ? minDPR : newDPR;
        }
    }

    var onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        const isPortrait = window.innerWidth < window.innerHeight;
        cc.view.setOrientation(isPortrait ? cc.macro.ORIENTATION_PORTRAIT : cc.macro.ORIENTATION_LANDSCAPE);
        cc.view.enableAutoFullScreen(false);
        if (cc.sys.os !== cc.sys.OS_ANDROID || cc.sys.browserType !== cc.sys.BROWSER_TYPE_UC) {
            cc.view.enableRetina(true);
        }
        if (isPortrait) {
            updateDPR(448, 740);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress, function (err, scene) {
            if (!err) {
                cc.director.runSceneImmediate(scene);
                if (cc.sys.isBrowser) {
                    // show canvas
                    var canvas = document.getElementById("GameCanvas");
                    canvas.style.visibility = "";
                    var div = document.getElementById("GameDiv");
                    if (div) {
                        div.style.backgroundImage = "";
                    }
                    console.log("Success to load scene: " + launchScene);
                }
            }
        });
    };

    var option = {
        id: "GameCanvas",
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    cc.assetManager.loadScript(
        settings.jsList.map(function (x) {
            return "src/" + x;
        }),
        cb
    );

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = typeof loadRuntime === "function";
    if (isRuntime) {
        require("src/settings.6be01.js");
        require("src/cocos2d-runtime.js");
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require("src/physics.js");
        }
        require("jsb-adapter/engine/index.js");
    } else {
        require("src/settings.6be01.js");
        require("src/cocos2d-jsb.js");
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require("src/physics.js");
        }
        require("jsb-adapter/jsb-engine.js");
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}

function initGA() {
    const gaCode = window.envConfig.systemType === "SC1" ? "G-83SN447D8K" : "G-RMDY57JTSG";

    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            console.log("Init GA");
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            let script;
            script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

initGA();
