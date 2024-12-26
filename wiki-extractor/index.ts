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
    // Get page content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page, status: ${response.status}`);
    }
    const body = await response.text();
    const $ = load(body);

    // Result object, containing chapter content
    const result: FetchResult = { Chapters: [] };

    // Current chapter object
    let currentChapter: Chapter | null = null;

    // Get all div.mw-heading tags
    $('div.mw-heading').each((index, element) => {
      // Get the chapter title
      const title = $(element).find('h2,h3').text().trim();
      console.log(`Found title: ${title}`); // Debug Output

      if (title) {
        // If the current chapter has content, save the current chapter and start a new chapter
        if (currentChapter && currentChapter.paragraphs.length > 0) {
          result.Chapters.push(currentChapter);
        }

        // Initialize new chapter
        currentChapter = { title, paragraphs: [] };
      }

      // Collect all p tag contents after the current div.mw-heading
      let nextElement = $(element).next(); // Get the next element
      while (nextElement.length && nextElement[0].name !== 'div') {
        if (nextElement[0].name === 'p') {
          nextElement.find('sup').remove();
          const paragraphContent = nextElement.text().trim();
          if (paragraphContent && paragraphContent.length > 20) {
            currentChapter.paragraphs.push(paragraphContent);
          }
        }
        nextElement = nextElement.next(); // Get the next element
      }
    });

    // Last chapter added
    if (currentChapter && currentChapter.paragraphs.length > 10) {
      result.Chapters.push(currentChapter);
    }

    // Saving the JSON file
    fs.writeFileSync('data/Richard_Stallman_Chapters.txt', JSON.stringify(result, null, 2));
    console.log('Page content saved to Richard_Stallman_Chapters.txt');
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

// Get Richard Stallman's page
fetchWikiPage('https://en.wikipedia.org/wiki/Richard_Stallman');

