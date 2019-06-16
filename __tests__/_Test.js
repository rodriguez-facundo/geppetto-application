const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');


const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}


describe('Test', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await page.goto('https://stemkoski.github.io/Three.js/Multiple-Cameras.html');
  });

  it('test', async() => {
    const repetitions = Array(10000).fill(1)

    for (let i in repetitions) {
      await page.keyboard.press(String.fromCharCode(87))
    }
  })
})
