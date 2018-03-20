const request = require('request-promise');
const cheerio = require('cheerio');

const nuligaUrl = 'https://hvn-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/groupPage';
const teamIDs = [
    '?championship=HVN+2017%2F18&group=214461', // 1. Herren
    '?championship=WSL+2017%2F18&group=213857', // 2. Herren
    '?championship=Hannover+2017%2F18&group=213901', // 3. Herren
    '?championship=Hannover+2017%2F18&group=213749', // 1. Damen
    '?championship=Hannover+2017%2F18&group=216436', // 1. Alte Herren
    '?championship=Hannover+2017%2F18&group=214567', // 2. Alte Herren
    '?championship=Hannover+2017%2F18&group=213649', // Lady Liga
];

function buildTableUri(teamId) {
    return nuligaUrl + teamId;
}

async function getTeamTable(teamId) {
    const options = {
        uri: buildTableUri(teamId),
        transform: (body) => cheerio.load(body)
    };

    const response = await request(options);
    const teamTable = extractTableData(response);
    return teamTable;
}

function extractTableData($) {
    const tableData = $('table.result-set:first-of-type tr')
        .filter((index, element) => index > 0) // 0 = table header
        .map((index, element) => {
            return {
                rank: $(element).find('td:nth-of-type(2)').text().trim(),
                team: $(element).find('td:nth-of-type(3)').text().trim(),
                matches: $(element).find('td:nth-of-type(4)').text().trim(),
                wins: $(element).find('td:nth-of-type(5)').text().trim(),
                losses: $(element).find('td:nth-of-type(6)').text().trim(),
                draws: $(element).find('td:nth-of-type(7)').text().trim(),
                goals: $(element).find('td:nth-of-type(8)').text().trim(),
                goalDifference: $(element).find('td:nth-of-type(9)').text().trim(),
                points: $(element).find('td:nth-of-type(10)').text().trim()
            };
        }).get();
    return tableData;
}

teamIDs.forEach(async (teamId) => {
    console.log(`Team ${teamId}: ${await getTeamTable(teamId)}`);
});