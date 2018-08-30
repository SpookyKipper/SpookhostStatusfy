const path = require('path')
const { promisify } = require('util')
const fs = require('fs')
const fse = require('fs-extra')

const renameP = promisify(fs.rename)
const logger = require('../lib/utils/logger')
const generateContent = require('./demo/generate-content')

const tempPath = path.resolve(__dirname, '.tmp')
const demoPath = path.resolve(__dirname, '../demo')
const tempBasePath = path.resolve(tempPath, 'base')

const prepare = async () => {
  await fse.emptyDir(tempPath)
  await fse.copy(demoPath, tempBasePath)
  await renameP(tempBasePath, path.resolve(tempPath, 'advanced'))
  await fse.emptyDir(path.resolve(tempBasePath, 'content'))

  generateContent(path.resolve(tempBasePath, 'content'), new Date('2018-08-30'), 10)

  const testProjects = ['simple', 'cli', 'advanced', 'invalid']

  for (const key of testProjects) {
    const dest = path.join(tempPath, key)
    const configFile = path.resolve(__dirname, `config/fragments/${key}.js`)

    await fse.copy(tempBasePath, dest)
    await fse.copy(configFile, path.join(dest, 'config.js'))

    if (key !== 'simple') {
      await fse.outputFile(path.join(dest, 'public/.keep'), '')
    }
  }
}

prepare().then(() => {
  logger.info('Preparing for testing ...')
})