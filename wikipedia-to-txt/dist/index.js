import { load } from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';

async function fetchWikiPage(url) {
  try {
    // 发送请求并获取页面内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page, status: ${response.status}`);
    }

    const body = await response.text();

    // 使用 cheerio 加载 HTML 页面
    const $ = load(body);

    let textContent = '';  // 存储最终输出内容

    // 遍历页面中的所有段落 <p> 标签
    $('p').each((index, element) => {
      const paragraph = $(element).text().trim();

      // 如果段落有内容，则添加到 textContent 中
      if (paragraph) {
        textContent += paragraph + '\n\n';  // 段落之间加两个换行符
      }
    });

    // 将抓取的文本保存到 .txt 文件
    fs.writeFileSync('Richard_Stallman_PureText.txt', textContent);
    console.log('Pure text content saved to Richard_Stallman_PureText.txt');
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

// 指定要抓取的页面 URL
fetchWikiPage('https://en.wikipedia.org/wiki/Richard_Stallman');

