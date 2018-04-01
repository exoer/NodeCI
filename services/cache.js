const mongoose = require('mongoose')
const keys = require('../config/keys')

const redis = require('redis')
// const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(keys.redisUrl)
const util = require('util')

client.hget = util.promisify(client.hget)


const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(options={}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '')
  return this
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))
  // console.log(key)

  // see if we have a value for key in redisUrl
  const cacheValue = await client.hget(this.hashKey, key)
  // if we do return that
  if (cacheValue) {
    // console.log('cv',this)
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)

  }
  //otherwise, isue the query and store the result in key

  const result = await exec.apply(this, arguments)
  client.hset(this.hashKey, key, JSON.stringify(result))
  // console.log('result', result)
  return result

}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
