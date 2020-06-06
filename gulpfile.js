const builder = require("electron-builder");

const { task, parallel, series, watch, src, dest } = require("gulp");
const inject = require("gulp-inject-string");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");

const rimraf = require("rimraf");

const { spawn } = require("child_process");
const electron = require("electron");

const namedTask = (name, task) => {
  task.displayName = name;
  return task;
};

/* State (for develop target) */
let watchers = [];
let browser_sync = null;

/* Electron */
let electron_process = null;
let stop_on_electron_exit = true;

const electron_start = namedTask("electron-start", (done) => {
  electron_process = spawn(electron, [".", "--no-sandbox"], {
    env: { ...process.env, NODE_ENV: "development" },
    stdio: "inherit",
  });
  electron_process.on("close", (code) => {
    if (stop_on_electron_exit) {
      console.log("electron closed", code);
      watchers.forEach(({ watcher, done }) => {
        watcher.close();
        done();
      });
      if (browser_sync != null) {
        browser_sync.exit();
      }
    } else {
      console.log("electron closed during restart", code);
    }
  });
  done();
});

const electron_stop = namedTask("electron-start", () => {
  electron_process.kill();
  return electron_process;
});

const electron_restart = series(
  namedTask("electron-disable-stop", (done) => {
    stop_on_electron_exit = false;
    done();
  }),
  electron_stop,
  electron_start,
  namedTask("electron-enable-stop", (done) => {
    stop_on_electron_exit = true;
    done();
  })
);

/* browserSync */

const browser_sync_inject = namedTask("browser-sync-inject", () =>
  src("src/app/index.html")
    .pipe(inject.before("</body>", browser_sync.getOption("snippet")))
    .pipe(
      inject.after(
        "script-src",
        " 'unsafe-eval' " + browser_sync.getOption("urls").get("local")
      )
    )
    .pipe(dest("build/app"))
);

const browser_sync_start = namedTask("browser-sync-start", (done) => {
  browser_sync = require("browser-sync").create();
  browser_sync.init(
    {
      ui: false,
      localOnly: true,
      port: 35829,
      ghostMode: false,
      open: false,
      notify: false,
      logSnippet: false,
    },
    (error) => done(error)
  );
});

const browser_sync_reload = namedTask("browser-sync-reload", (done) => {
  browser_sync.reload();
  done();
});

/* Builds */

const build_release = namedTask("build-release", () =>
  src("src/**/*.js")
    .pipe(babel())
    .pipe(inject.replace("process.env.NODE_ENV", '"production"'))
    .pipe(dest("build"))
);

const build_develop = namedTask("build-develop", () =>
  src("src/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(dest("build"))
);

/* never used from cli, keep as function instead */
const assets_copy = namedTask("assets-copy", () =>
  src(["src/**/*.html", "src/**/*.css"]).pipe(dest("build"))
);

task("clean", (done) => rimraf("./build", done));

task("build", series("clean", assets_copy, build_release));

task(
  "develop",
  series(
    "clean",
    assets_copy,
    build_develop,
    browser_sync_start,
    browser_sync_inject,
    electron_start,
    parallel(
      namedTask("watch-electron", (done) =>
        watchers.push({
          watcher: watch(
            ["src/app/**/*.js"],
            series(build_develop, electron_restart)
          ),
          done,
        })
      ),
      namedTask("watch-ui", (done) =>
        watchers.push({
          watcher: watch(
            ["src/app/**/*.js"],
            series(build_develop, browser_sync_reload)
          ),
          done,
        })
      ),
      namedTask("watch-assets", (done) =>
        watchers.push({
          watcher: watch(
            ["src/**/*.html", "src/**/*.css"],
            series(assets_copy, browser_sync_inject, browser_sync_reload)
          ),
          done,
        })
      )
    )
  )
);

task(
  "pack",
  series(
    "build",
    namedTask("build-win", () =>
      builder.build({
        targets: builder.Platform.WINDOWS.createTarget(),
      })
    ),
    namedTask("build-mac", () =>
      builder.build({
        targets: builder.Platform.MAC.createTarget(),
      })
    ),
    namedTask("build-linux", () =>
      builder.build({
        targets: builder.Platform.LINUX.createTarget(),
      })
    )
  )
);
