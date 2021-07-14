// @ts-check

/**
 * copied from https://github.com/vitejs/vite/blob/main/scripts/release.js
 */

const prompts = require('prompts');
const path = require('path')
const semver = require('semver')
const { spawnSync } = require('child_process')
const fs = require('fs')

const pkgPath = path.resolve(path.resolve(process.cwd(), 'package.json'))
const currentVersion = require(pkgPath).version

const inc = (i) => semver.inc(currentVersion, i, 'beta')


const blueBright = msg => console.log(color(94, 39)(msg))
const run = (command, args = [], options = {}) => {
    const { error } = spawnSync(command, args, { stdio: 'inherit', ...options })
    if (error) {
        throw (error)
    }
}

const versionIncrements = [
    'patch',
    'minor',
    'major',
    'prepatch',
    'preminor',
    'premajor',
    'prerelease'
];

async function main() {
    let targetVersion
    const { release } = await prompts({
        type: 'select',
        name: 'release',
        message: 'Select release type',
        choices: versionIncrements
            .map((i) => `${i} (${inc(i)})`)
            .concat(['custom'])
            .map((i) => ({ value: i, title: i }))
    })

    if (release === 'custom') {
        const res = await prompts({
            type: 'text',
            name: 'version',
            message: 'Input custom version',
            initial: currentVersion
        })
        targetVersion = res.version
    } else {
        targetVersion = release.match(/\((.*)\)/)[1]
    }

    if (!semver.valid(targetVersion)) {
        throw new Error(`invalid target version: ${targetVersion}`)
    }

    const tag = `v${targetVersion}`

    const { yes } = await prompts({
        type: 'confirm',
        name: 'yes',
        message: `Releasing ${tag}. Confirm?`
    })

    if (!yes) {
        return
    }

    blueBright(('\nUpdating package version...'));
    updateVersion(targetVersion)

    //  blueBright('\Testing package...')
    //  run('yarn', ['test'])

    // blueBright('\nBuilding package...')
    // run('yarn', ['build'])


    blueBright('\nCommitting changes...')
    run('git', ['add', '.'])
    run('git', ['commit', '-m', `release: ${tag}`])


    // blueBright('\nPublishing package...')
    // publishPackage(targetVersion)

    blueBright('\nPushing to GitHub...')
    run('git', ['tag', tag])
    run('git', ['push', 'origin', `refs/tags/${tag}`])
    run('git', ['push'])
};


function updateVersion(version) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.version = version
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}


function publishPackage(version) {
    const publicArgs = [
        'publish',
        '--no-git-tag-version',
        '--new-version',
        version,
        '--access',
        'public'
    ]
    run('yarn', publicArgs)
}


main().then(() => {
    blueBright('ok')
})
    .catch((err) => {
        console.error(err)
    })

//  https://github.com/marvinhagemeister/kolorist/blob/main/src/index.ts
function color(
    start,
    end
) {
    return (str) => {
        return `\x1b[${start}m4${str}\x1b[${end}m`
    };
}