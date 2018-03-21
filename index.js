const express = require('express');
const bodyParser = require('body-parser');
const TableProvider = require('./table-provider');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

const router = express.Router();

const tableProvider = new TableProvider();

// ROUTES FOR OUR API
// =============================================================================
router.get('/', (req, res) => {
    res.json({ message: 'API works!' });
});

router.route('/table/:teamId')
    .get(async (req, res) => {
        const { teamId } = req.params;
        console.log(`Table request for team ${teamId}`);
        const tableData = await tableProvider.getTeamTable(teamId);
        res.json({ table: tableData });
    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('TuS Vinnhorst API is now running on port ' + port);