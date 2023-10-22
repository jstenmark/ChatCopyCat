import * as vscode from 'vscode';

async function generateInputOrSelectOptions(
	title: string,
	items: string[],
	customItemLabel: string
): Promise<string[]> {
	const customItem = `${customItemLabel} (Input Custom)`;
	const options = [
		{ label: customItem, description: `Input custom ${title}` },
		...items.map((item) => ({ label: item, description: `Select ${title}` })),
	];
	const selectedOption = await vscode.window.showQuickPick(options, {
		placeHolder: `Select or Input ${title}`
	});
	if (selectedOption) {
		if (selectedOption.label === customItem) {
			const customInput = await vscode.window.showInputBox({
				placeHolder: `Enter Custom ${title}`,
			});
			return customInput ? [customInput] : [];
		} else {
			return [selectedOption.label];
		}
	}
	return [];
}


export async function generateAdditionalInformationExamples(): Promise<string[]> {
  const examples = [
    'This is part of a larger project.',
    'Im getting a "TypeError" when running the code.',
    'This code is part of a larger project related to e-commerce.',
    'Im following a tutorial on YouTube, and Im stuck at this step.',
    'Im working on a personal project for data analysis.',
    'This code is intended to be used in a web application.',
    'Ive already tried changing the variable names, but it didnt work.',
    'Im using the latest version of Node.js.',
    'Im new to programming and trying to learn JavaScript.',
    'This code was working fine until I made some changes yesterday.',
  ];

  return generateInputOrSelectOptions(
    'Additional Information',
    examples,
    'Custom'
  );
}

export async function generateQuestionTypes(): Promise<string[]> {
  const types = [
    'Optimization',
    'Syntax',
    'Logic',
    'Debugging',
    'Error Handling',
    'Code Structure',
    'Performance',
    'Testing',
    'Security',
    'Documentation',
  ];

  return generateInputOrSelectOptions('Question Type', types, 'Custom');
}



export function generateCodeRelatedQuestions(): string[] {
  return [
    'How can I optimize this algorithm for better performance?',
    'Im struggling with a type error in my TypeScript code. Can someone help?',
    'I need assistance with implementing authentication in my web app.',
    'How do I use async/await in Python for asynchronous operations?',
    'Im looking for a solution to handle file uploads in Node.js.',
    'Whatss the best practice for handling exceptions in Express applications?',
    'Im trying to integrate a third-party API into my project. Any tips?',
    'How can I improve the security of my PHP application?',
    'Im getting a CORS error in my React app. How can I fix it?',
    'Can someone review my SQL query and suggest improvements?',
  ];
}



