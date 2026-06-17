const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

const builds = [
  {
    input: path.join(root, 'upload/admin/view/javascript/gt_courier/settings.js'),
    output: path.join(root, 'upload/admin/view/javascript/gt_courier/settings.compiled.js'),
  },
  {
    input: path.join(root, 'upload/admin/view/javascript/gt_courier/order_info.js'),
    output: path.join(root, 'upload/admin/view/javascript/gt_courier/order_info.compiled.js'),
  },
];

async function buildOne({ input, output }) {
  const source = await fs.promises.readFile(input, 'utf8');
  const result = await esbuild.transform(source, {
    loader: 'jsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2017',
    format: 'iife',
    sourcemap: false,
  });

  await fs.promises.writeFile(output, result.code, 'utf8');
  console.log(`Built ${path.relative(root, output)}`);
}

async function main() {
  for (const build of builds) {
    await buildOne(build);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
