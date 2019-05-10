const evaluate = require('./testsuite').evaluate;

const validateCss = require('../lib/validator').validateCss;
const grabCSS3Variables = require('../lib/validator').grabCSS3Variables;
const openFile = require('../lib/ressource-utils').openFile;

const buildHtml = (cssList) => {
	const cssString = cssList
		.map(cssFile => `<link rel="stylesheet" href="/test/files/${cssFile}">`)
		.reduce((acc, val) => `${acc}\n\t${val}`, '');

	return `
		<!DOCTYPE html>
		<html lang="de">
		<head>
			<meta charset="UTF-8">
			<title>Testfile</title>
			${cssString}
			</head>
			<body>
				<h1>Oh - Hi Visitor!</h1>
			</body>
			</html>`;
}


const runTest = (name, expected, html, shouldExtractCssVariables = true) => {
	return new Promise((resolve, _) => {
		try {
			validateCss({html}, shouldExtractCssVariables).then(result => {
				const determined = !result.html.includes("Error");
				resolve(evaluate(name, determined, expected));
			}).catch(e => {
				resolve(evaluate(name, false, expected));
			});
		} catch(e) {
			resolve(evaluate(name, false, expected));
		}
	})
};

/*
	https://medium.freecodecamp.org/everything-you-need-to-know-about-css-variables-c74d922ea855
	
 */


const empty = () => {
	return runTest('empty', true, buildHtml(['empty.css']));
}

const validSimple = () => {
	return runTest('validSimple', true, buildHtml(['fine.css']));
};

const validShouldExtractCssVariables = () => {
	return runTest('validShouldExtractCssVariables', true, buildHtml(['css3-variables-root.css', 'css3-variables-var.css']), true);
};

const validShouldNotExtractCssVariables = () => {
	return runTest('validShouldNotExtractCssVariables', true, buildHtml(['fine.css']), false);
};

const invalidShouldNotExtractCssVariables = () => {
	return runTest('invalidShouldNotExtractCssVariables', false, buildHtml(['css3-variables-root.css', 'css3-variables-var.css']), false);
};

const validVariablesWithoutUsing = () => {
	return runTest('validVariablesWithoutUsing', true, buildHtml(['css3-variables-root.css']));
}

const validVariables = () => {
	return runTest('validVariables', true, buildHtml(['css3-variables-root.css', 'css3-variables-var.css']));
}

const validVariablesMixed = () => {
	return runTest('validVariablesMixed', true, buildHtml(['css3-variables-root.css', 'fine.css', 'css3-variables-var.css']));
}

const validVariablesUnordered = () => {
	return runTest('validVariablesUnordered', true, buildHtml(['fine.css', 'css3-variables-var.css', 'fine.css', 'css3-variables-root.css']));
}

const validMultipleRoot = () => {
	return runTest('validMultipleRoot', true, buildHtml(['css3-variables-multiple-root.css', 'css3-variables-var.css']));
}

const validNestedRoot = () => {
	return runTest('validNestedRoot', true, buildHtml(['css3-variables-nested-root.css', 'css3-variables-var.css']));
}

const validNestedMultipleRoot = () => {
	return runTest('validNestedMultipleRoot', true, buildHtml(['css3-variables-nested-multiple-root.css', 'css3-variables-var.css']));
}

const validMultipleNestedRoot = () => {
	return runTest('validMultipleNestedRoot', true, buildHtml(['css3-variables-multiple-nested-root.css', 'css3-variables-var.css']));
}

const invalidSimple = () => {
	return runTest('invalidSimple', false, buildHtml(['bad.css']));
}

const invalidVariablesWithoutRoot = () => {
	return runTest('invalidVariablesWithoutRoot', false, buildHtml(['css3-variables-var.css']));
}

const invalidVariableNames = () => {
	return runTest('invalidVariableNames', false, buildHtml(['css3-variables-root.css', 'css3-variables-var-1.css']));
}



module.exports = () => {
	empty()
		.then(validSimple)
		.then(validShouldExtractCssVariables)
		.then(validShouldNotExtractCssVariables)
		.then(invalidShouldNotExtractCssVariables)
		.then(validVariablesWithoutUsing)
		.then(validVariables)
		.then(validVariablesMixed)
		.then(validVariablesUnordered)
		.then(validMultipleRoot)
		.then(validNestedRoot)
		.then(validNestedMultipleRoot)
		.then(validMultipleNestedRoot)
		.then(invalidSimple)
		.then(invalidVariablesWithoutRoot)
		.then(invalidVariableNames);
};
