/* eslint-disable no-useless-escape */

/*
 * Useful for converting a string to title case.
 * Output: "Express Js Crash Course For Beginners"
 *  ## Example Uses:
 * 1. Input => toTitleCase("express js crash course for beginners")
 * output: Express Js Crash Course For Beginners
 * 2. Object => toTitleCase({name: "express js crash course for beginners", profession: "developer"})
 * output: {name: "Express Js Crash Course For Beginners", profession: "Developer"}
 * 3. Array => ["Hello", "world", "developer"].map(toTitleCase)
 * output: ["Hello", "World", "Developer"]
 * */

export const toTitleCase = (str: string): string =>
  str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/*
 * Useful for creating URL-friendly slugs from text.
 * Output: express-js-crash-course-for-beginners
 *  ## Example Uses:
 * 1. slugify("express js crash course for beginners")
 * output: express-js-crash-course-for-beginners
 *
 */
export const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // space → dash
    .replace(/&/g, '-and-') // & → and
    .replace(/[^\w\-]+/g, '') // remove non-word
    .replace(/\-\-+/g, '-'); // multiple dash → single dash
