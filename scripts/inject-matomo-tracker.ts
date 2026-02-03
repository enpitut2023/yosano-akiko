import { readFileSync, writeFileSync } from "node:fs";
import { argv, exit } from "node:process";

if (argv.length < 3) {
  console.error(`Usage: ${argv[1]} [file.html ...]`);
  exit(1);
}
const filenames = argv.slice(2);

const MARKER = "matomo_F86CUHuMokQeLdup5Bt7AyqrECb6LPwS";
const TRACKER = `
<!-- ${MARKER} -->
<script>
  var _paq = (window._paq = window._paq || []);
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
  (function () {
    var u = "//139-162-123-42.ip.linodeusercontent.com/";
    _paq.push(["setTrackerUrl", u + "matomo.php"]);
    _paq.push(["setSiteId", "1"]);
    var d = document,
      g = d.createElement("script"),
      s = d.getElementsByTagName("script")[0];
    g.async = true;
    g.src = u + "matomo.js";
    s.parentNode.insertBefore(g, s);
  })();
</script>
`;

let ok = true;

for (const filename of filenames) {
  console.log(`Injecting matomo tracker into ${filename}`);
  let html = readFileSync(filename, { encoding: "utf8" });
  if (!html.includes("<head>")) {
    console.log("<head> was not found");
    ok = false;
    continue;
  }
  if (html.includes(MARKER)) {
    console.log("Tracker already in the file");
    ok = false;
    continue;
  }
  html = html.replace("<head>", "<head>" + TRACKER);
  writeFileSync(filename, html, { encoding: "utf8" });
}

if (!ok) {
  exit(1);
}
