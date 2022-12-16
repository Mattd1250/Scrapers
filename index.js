const puppeteerExtra = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

const puppeteer = require('puppeteer');

const lawyerInfoScraper = async (lawyersList) => {
	let completedLawyersList = [];
	puppeteerExtra.use(stealthPlugin());

	for (const lawyer of lawyersList) {
		const browser = await puppeteer.launch({
			// headless: false,
			slowMo: 50,
			// devtools: true,
		});

		const page = await browser.newPage();

		await page.goto('https://www.floridabar.org/directories/find-mbr', {
			waitUntil: 'load',
		});

		const barNumber = lawyer.barNumber;

		let barNumberInput = await page.$('#bar-number-input');

		await barNumberInput.type(barNumber);

		await barNumberInput.press('Enter');

		await page.waitForNavigation();

		await page.click('.profile-name a');

		await page.waitForSelector('.row');

		const secondPageInfo = await page.evaluate(() => {
			let rowInfo = [];
			Array.from(document.querySelectorAll('.row'), (row) => {
				if (row.querySelector('label') === null) return;
				let label = row.querySelector('label').innerText;
				let practiceAreasArr = [];
				let description =
					row.querySelector('div:nth-child(2) p') === null
						? null
						: row.querySelector('div:nth-child(2) p').innerHTML;

				switch (label) {
					case 'Mail Address:':
						rowInfo.push({ address: description });
						break;

					case 'County:':
						rowInfo.push({ county: description });
						break;

					case 'Practice Areas:':
						Array.from(row.querySelectorAll('div:nth-child(2) p'), (area) =>
							practiceAreasArr.push(area.innerText)
						);
						rowInfo.push({ practiceAreas: practiceAreasArr });
						break;

					case 'Firm:':
						rowInfo.push({ firm: description });
						break;

					case 'Firm Position:':
						rowInfo.push({ firmPosition: description });
						break;

					case 'Firm Website:':
						rowInfo.push({
							firmWebsite: row.querySelector('div:nth-child(2) p a').href,
						});
						break;

					default:
						break;
				}
			});
			let scrapedInformation = Object.assign({}, ...rowInfo);
			return scrapedInformation;
		});

		completedLawyersList.push({ ...lawyer, ...secondPageInfo });
		await browser.close();
	}
	console.log('completedLawyersList', completedLawyersList);
};

lawyerInfoScraper([
	{ barNumber: '515523' },
	{ barNumber: '171560' },
	{ barNumber: '374350' },
	{ barNumber: '92674' },
	{ barNumber: '171560' },
]);
