const request = require('request-promise');
const cheerio = require('cheerio');

class TableProvider {

    constructor() {
        this.MEMOIZATION_DURATION = 3600000; // 1 hour
        this.nuligaUrl = 'https://hvn-handball.liga.nu/cgi-bin/WebObjects/nuLigaHBDE.woa/wa/groupPage';
        this.teams = {
            '214461': {
                name: '1. Herren',
                url: '?championship=HVN+2017%2F18&group=214461',
            },
            '213857': {
                name: '2. Herren',
                url: '?championship=WSL+2017%2F18&group=213857',
            },
            '213901': {
                name: '3. Herren',
                url: '?championship=Hannover+2017%2F18&group=213901',
            },
            '213749': {
                name: '1. Damen',
                url: '?championship=Hannover+2017%2F18&group=213749',
            },
            '216436': {
                name: '1. Alte Herren',
                url: '?championship=Hannover+2017%2F18&group=216436',
            },
            '214567': {
                name: '2. Alte Herren',
                url: '?championship=Hannover+2017%2F18&group=214567',
            },
            '213649': {
                name: 'Lady Liga',
                url: '?championship=Hannover+2017%2F18&group=213649',
            },
        };
    }

    async getTeamTable(teamId) {
        const now = new Date().getTime();
        const team = this.teams[teamId];
        
        if (!team) {
            throw new Error(`Team with ID ${teamId} is missing.`);
        }

        if (team.lastUpdate && team.table && now <= team.lastUpdate + this.MEMOIZATION_DURATION) {
            console.log('Found memoized table');
            return team.table;
        }

        const options = {
            uri: this.buildTableUri(team),
            transform: (body) => cheerio.load(body)
        };
    
        console.log(`No memoized table found. Sending nuliga table request to ${options.uri}`);
        const response = await request(options);
        const teamTable = this.extractTableData(response);
        this.memoizeTable(team, teamTable);

        return teamTable;
    }

    buildTableUri(team) {
        return this.nuligaUrl + team.url;
    }

    extractTableData($) {
        const tableData = $('table.result-set:first-of-type tr')
            .filter((index, element) => index > 0) // 0 = table header
            .map((index, element) => {
                return {
                    rank: $(element).find('td:nth-of-type(2)').text().trim(),
                    team: $(element).find('td:nth-of-type(3)').text().trim(),
                    matches: $(element).find('td:nth-of-type(4)').text().trim(),
                    wins: $(element).find('td:nth-of-type(5)').text().trim(),
                    draws: $(element).find('td:nth-of-type(6)').text().trim(),
                    losses: $(element).find('td:nth-of-type(7)').text().trim(),
                    goals: $(element).find('td:nth-of-type(8)').text().trim(),
                    goalDifference: $(element).find('td:nth-of-type(9)').text().trim(),
                    points: $(element).find('td:nth-of-type(10)').text().trim()
                };
            }).get();
        return tableData;
    }

    memoizeTable(team, table) {
        team.table = table;
        team.lastUpdate = new Date().getTime();
    }

}

module.exports = TableProvider;