'use strict';

import htmlValidator from 'html-validator';
import cssValidator from 'w3c-css';


import { exists, openFile } from './ressource-utils';
import { isDefined } from './helper';

import { HtmlValidationError, CssValidationError, FileNotFoundError, isConnectionError, CSS3VariableNotFoundError } from './customError.js';


export function validateHtml(result) {
    const options = { format: 'text', data: result.html };

    return htmlValidator(options)
        .then(evaluation => {

            if (isDefined(evaluation) && (evaluation.includes('Error:') || evaluation.includes('Warning:'))) {
                throw HtmlValidationError(evaluation, result.html);
            } else {
                return Promise.resolve(result);
            }
        }).catch(error => {
            if (isDefined(error)) {
                if (isConnectionError(error)) {
                    console.log("Warning (HTML): could not establish internet connection to the html validator: validation skipped.");
                } else {
                    throw HtmlValidationError(error, result.html);
                }
            }
            return Promise.resolve(result);
        });
}


/**
 * Find and remove CSS3-Variables
 *
 * @param css CSS-Content as a String
 *
 * return Map of CSS3-Variables: {@key: var-name => @value: var-value}
 */
export function grabCSS3Variables(css) {
    const regex = /(\:root\s*\{\s*)([\s\S]+?(?=\s*\}))(\s*\})/g;
    let resultCss = css;
    let cssVariables = {};

    let match = regex.exec(css);

    while (match != null && match[0]) {
        // first: extract root-Scope of CSS3-Variable-Declaration
        resultCss = `${match[1]} ${match[3]}`;
        // then extract CSS3-Variables from that Extraction
        const regexCSSVariables = /(--.*)(\s*:\s*)(.*)(\s*;)/g;
        let matchCSSVariables = regexCSSVariables.exec(match[2]);

        while (matchCSSVariables != null) {
            cssVariables[matchCSSVariables[1]] = matchCSSVariables[3];
            matchCSSVariables = regexCSSVariables.exec(match[2]);
        }

        match = regex.exec(css);
    }

    return {
        css: resultCss,
        variables: cssVariables
    };
}

/**
 * Replace CSS3-Variables by a given Mapping.
 *
 * @throws CSS3VariableNotFoundError if CSS3-Variable found, but no definition is given
 *
 * @param css CSS-Content as a string
 * @param variables Map of CSS3-Variables: {@key: var-name => @value: var-value}
 *
 * return modified CSS-Content as a string
 */
export function replaceCSS3Variables(fname, css, variables) {
    let resultCss = '';

    const regex = /([\s\S]+?)(var\()(--[\w-]*)(\)\s*)(;?)/g;
    let match = regex.exec(css);
    let lastIndex = 0;

    // find and replace every CSS3-Variable with its definition
    while (match != null) {
        if (!variables[match[3]]) {
            throw CSS3VariableNotFoundError(fname, match[3]);
        }
        resultCss = `${resultCss} ${css.substring(match.index, match.index + match[1].length)} ${variables[match[3]]} ${match[5]}`;

        lastIndex += match[0].length;
        match = regex.exec(css);
    }

    // rest of CSS-file
    resultCss = resultCss + css.substring(lastIndex, css.length);

    return resultCss;
}

//TODO: more documentation
/**
 * Validates CSS with the official w3c-Validator.
 *
 * @exception CSS3-Variables in Media-Queries do not work properly (you have to reload the page)
 *
 * @todo Breaks, if contains relative paths
 *
 * @param result
 * @param shouldExtractCssVariables
 *
 * @returns {*}
 */
export function validateCss(result, shouldExtractCssVariables = false) {
    const regex = /(<link.*href=\")(.*.css)(\")/g;
    let match = regex.exec(result.html);
    let queue = Promise.resolve(result);
    const cssFiles = [];

    while (match != null) {
        const pathToFile = match[2].startsWith('/') ? match[2].substr(1) : match[2];

        if (!pathToFile.includes('http')) {
            if (exists(pathToFile)) {
                const file = openFile(pathToFile);
                cssFiles.push({fname: pathToFile, content: file});

            } else {
                return Promise.reject(FileNotFoundError(`Could not find Stylesheet ${pathToFile}`));
            }
        }

        match = regex.exec(result.html);
    }

    let cssVariables = {};
    cssFiles.map(({fname, content}) => {
        const {css, variables} = shouldExtractCssVariables ? grabCSS3Variables(content) : {css: content, variables: {}};
        cssVariables = Object.assign(cssVariables, variables);
        return {fname, content: css};

    })    .map(({fname, content}) => {
        return {fname, content: shouldExtractCssVariables ? replaceCSS3Variables(fname, content, cssVariables) : content};
    })
        .forEach(({fname, content}) => {
            if (content.replace(/\s/g,'').length > 0) {
                const cssValidatorOptions = {
                    text: content,
                    profile: "css3",
                    warning: 1
                };

                queue = queue.then(_  => new Promise((resolve, reject) => {
                    cssValidator.validate(cssValidatorOptions, (error, evaluation) => {

                        if (isDefined(error)) {
                            if (isConnectionError(error)) {
                                console.log("Warning (CSS): could not establish internet connection to the css validator: validation skipped.");
                                resolve(result);
                            } else {
                                reject(CssValidationError(error, result.html));
                            }

                        } else if (isDefined(evaluation) && isDefined(evaluation.errors) && evaluation.errors.length > 0) {
                            const msg = evaluation.errors.map(err => `${err.message.trim()} (in line ${err.line})`).join('\n');
                            reject(CssValidationError(msg, result.html, cssValidatorOptions.text));

                        } else if (isDefined(evaluation) && isDefined(evaluation.warnings) && evaluation.warnings.length > 0) {
                            // TODO: render Warning Page
                            const msg = evaluation.warnings.map(err => `${err.message.trim()} (in line ${err.line})`).join('\n');
                            reject(CssValidationError(msg, result.html, cssValidatorOptions.text));

                        } else {
                            resolve(result);
                        }
                    });
                }));
            }
        });


    return queue;
}
