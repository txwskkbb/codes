import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import * as cheerio from 'cheerio';

const $ = cheerio.load(data);  // 使用 cheerio 解析 HTML
const pageTitle = $('title').text();  // 例如，获取页面标题
console.log(pageTitle);  // 打印页面标题，查看是否能正确解析

const url = 'https://en.wikipedia.org/wiki/Richard_Stallman';

async function fetchAndConvertToText() {
  try {
    // 请求 Wikipedia 页面
    const response = await axios.get(url);

    // 打印响应的状态码
    console.log('Response status:', response.status);

    // 获取返回的 HTML 数据
    const data = response.data;

    // 如果没有数据，抛出错误
    if (!data) {
      throw new Error('No data returned from the request');
    }

    // 打印部分数据内容（前 1000 个字符）
    console.log('Fetched data snippet:', data.substring(0, 1000));

    // 使用 cheerio 加载 HTML 数据
    const $ = cheerio.load(data);

    // 提取页面的主要内容
    const content = $('#mp-upper').nextAll().text();

    if (!content) {
      console.log('No content found.');
      return;
    }

    // 将内容写入 .txt 文件
    fs.writeFileSync('Richard_Stallman.txt', content);
    console.log('Content has been saved to Richard_Stallman.txt');
  } catch (error) {
    console.error('Error fetching the page:', error);
  }
}

fetchAndConvertToText();

