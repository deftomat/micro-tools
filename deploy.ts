import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const BUILD_DIR = '.build';
const BRANCH = 'gh-pages';

function deploy() {
  const buildPath = join(process.cwd(), BUILD_DIR);

  if (!existsSync(buildPath)) {
    console.error(`❌ Build directory '${BUILD_DIR}' does not exist. Run build first.`);
    process.exit(1);
  }

  try {
    // Get the remote repo URL from the main project
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
    if (!remoteUrl) {
      throw new Error('Could not find remote origin URL.');
    }

    console.log(`🚀 Deploying ${BUILD_DIR} to ${BRANCH}...`);

    // Clean up any old git state inside the build folder if it exists
    execSync(`rm -rf .git`, { cwd: buildPath });

    // Initialize an empty repo in the build output, commit, and push
    run('git init', buildPath);
    run(`git checkout -b ${BRANCH}`, buildPath);
    run('git add -A', buildPath);
    run('git commit -m "Deploy to GitHub Pages"', buildPath);
    run(`git push -f ${remoteUrl} ${BRANCH}`, buildPath);
    run('rm -rf .git', buildPath);

    console.log('✅ Deployment successful!');
  } catch (error) {
    console.error('❌ Deployment failed.');
    process.exit(1);
  }
}

function run(command: string, cwd?: string) {
  console.log(`\x1b[90m> ${command}\x1b[0m`);
  execSync(command, { stdio: 'inherit', cwd });
}

deploy();
