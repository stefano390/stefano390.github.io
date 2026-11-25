// node scripts/casina/build.cjs <checkout de movimientos-casina con npm run build>
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.argv[2]);
const output = path.resolve(__dirname, "../../vistas/casina");
const esbuild = require(path.join(root, "node_modules/esbuild"));

async function build() {
  fs.mkdirSync(output, { recursive: true });
  const component = name => path.join(root, "app", name + ".tsx");
  await esbuild.build({
    entryPoints: [path.join(__dirname, "entry.jsx")], outfile: path.join(output, "demo.js"),
    bundle: true, minify: true, legalComments: "eof", jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    nodePaths: [path.join(root, "node_modules")],
    alias: {
      "casina-dashboard": component("dashboard"), "@/lib/finance": path.join(root, "lib/finance.ts"),
      "next/link": path.join(__dirname, "navigation.jsx"), "next/navigation": path.join(__dirname, "navigation.jsx"),
    },
    plugins: [{ name: "demo-local", setup(build) {
      build.onResolve({ filter: /^\.\/actions$/ }, () => ({ path: path.join(__dirname, "store.js") }));
      build.onLoad({ filter: /movement-dialogs\.tsx$/ }, args => ({
        contents: fs.readFileSync(args.path, "utf8").split("export function BackupModal")[0]
          .replace("importBackupAction,", ""), loader: "tsx",
      }));
      build.onLoad({ filter: /dashboard\.tsx$/ }, args => {
        const contents = fs.readFileSync(args.path, "utf8")
          .replace(/import (PrivateNavigation|LogoutButton) from .*?;/g, "")
          .replace("<PrivateNavigation />", "").replace("<LogoutButton />", '<a className="logout-button" href="../../index.html#proyectos">Salir de la demo</a>')
          .replace("BackupModal,", "").replace(/const \[backup, setBackup\].*?;/, "")
          .replace(/<button className="action secondary" onClick=\{\(\) => setBackup\(true\)\}>[\s\S]*?<\/button>/, "")
          .replace("{backup && <BackupModal close={() => setBackup(false)} />}", "")
          .replace("Comisión de Renata", "Comisión de gestión");
        if (/setBackup|<LogoutButton|<PrivateNavigation/.test(contents)) throw Error("Revisar adaptación del panel.");
        return { contents, loader: "tsx" };
      });
    }}],
  });
  const cssDir = path.join(root, "dist/client/_next/static/css");
  const styles = fs.readdirSync(cssDir).filter(name => name.endsWith(".css"));
  if (styles.length !== 1) throw Error("Revisar hojas de estilo del build original.");
  fs.writeFileSync(path.join(output, "app.css"), fs.readFileSync(path.join(cssDir, styles[0]), "utf8").replaceAll("/casina-logo.png", "./logo.png"));
  fs.copyFileSync(path.join(root, "public/casina-logo.png"), path.join(output, "logo.png"));
}
build().catch(error => { console.error(error); process.exitCode = 1; });
