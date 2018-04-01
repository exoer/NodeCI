// const puppeteer = require('puppeteer')
// const sessionFactory = require('./factories/sessionFactory')
// const userFactory = require('./factories/userFactory')
const Page = require('./helpers/page')

// test('Adds two numbers', ()=>{
//   const sum = 1 + 2
//
//   expect(sum).toEqual(3)
// })
// let browser, page
let page

beforeEach(async ()=>{
  // browser = await puppeteer.launch({
  //   headless: false
  // })
  // page = await browser.newPage()
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async ()=>{
  // await browser.close()
  await page.close()
})

test('the header has the correct text', async ()=>{

  // const text = await page.$eval('a.brand-logo', el=> el.innerHTML)
  const text = await page.getContentsOf('a.brand-logo')

  expect(text).toEqual("Blogster")
})

test('clicking login starts the oauth flow', async() => {
  await page.click('.right a');
  const url = await page.url()
  expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows a logout button', async()=>{
  // const id = '5abd336873f5d5424b9ab05b'
  await page.login()

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

  expect(text).toEqual('Logout')
})
