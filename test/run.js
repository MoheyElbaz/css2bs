import { convertCssToBootstrap } from "../src/index.js";
const css = `
.card { padding: 1rem; margin: .5rem; line-height: 1.5; }
.btn-primary { padding-left: 16px; padding-right: 16px; }
`;
const res = await convertCssToBootstrap(css, {});
console.log(res.text);
