import { load } from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';

interface Chapter {
  title: string;
  paragraphs: string[];
}

interface FetchResult {
  Chapters: Chapter[];
}

async function fetchWikiPage(url: string): Promise<void> {
  try {
    // 获取页面内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page, status: ${response.status}`);
    }
    const body = await response.text();
    const $ = load(body);

    // 结果对象，包含章节内容
    const result: FetchResult = { Chapters: [] };

    // 当前章节对象
    let currentChapter: Chapter | null = null;

    // 获取所有 div.mw-heading 标签
    $('div.mw-heading').each((index, element) => {
      // 获取章节标题
      const title = $(element).find('h2,h3').text().trim();
      console.log(`Found title: ${title}`); // 调试输出

      if (title) {
        // 如果当前章节有内容，保存当前章节并开始新章节
        if (currentChapter && currentChapter.paragraphs.length > 0) {
          result.Chapters.push(currentChapter);
        }

        // 初始化新章节
        currentChapter = { title, paragraphs: [] };
      }

      // 从当前 div.mw-heading 后面收集所有 p 标签内容
      let nextElement = $(element).next(); // 获取下一个元素
      while (nextElement.length && nextElement[0].name !== 'div') {
        if (nextElement[0].name === 'p') {
          nextElement.find('sup').remove();
          const paragraphContent = nextElement.text().trim();
          if (paragraphContent && paragraphContent.length > 20) {
            currentChapter.paragraphs.push(paragraphContent);
          }
        }
        nextElement = nextElement.next(); // 获取下一个元素
      }
    });

    // 最后一章节添加
    if (currentChapter && currentChapter.paragraphs.length > 10) {
      result.Chapters.push(currentChapter);
    }

    // 保存 JSON 文件
    fs.writeFileSync('Richard_Stallman_Chapters.txt', JSON.stringify(result, null, 2));
    console.log('Page content saved to Richard_Stallman_Chapters.txt');
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

// 获取 Richard Stallman 页面
fetchWikiPage('https://en.wikipedia.org/wiki/Richard_Stallman');

