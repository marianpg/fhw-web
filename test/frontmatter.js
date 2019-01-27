const evaluate = require('./testsuite').evaluate;
const parseYaml = require('../lib/helper').parseYaml;
const unpackSqlResult = require('../lib/helper').unpackSqlResult;
const connectToSQLdb = require('../lib/compile').connectToSQLdb;




module.exports = () => {
    let yaml = '- alle_alben: SELECT * FROM albums WHERE ArtistId = 51;\n';
    yaml += '- dieses_album: SELECT * FROM albums WHERE AlbumId = 186;\n';
    yaml += '- genug_zeiten: >\n   SELECT Count(*) > 5\n   FROM albums\n   WHERE albums.ArtistId = 51;\n';
    console.log(yaml);
    let str = parseYaml(yaml);
    console.log(str);

	let SqlResult = [{id: 0, name: 'Marcus'}, {id: 1, name: 'Michael'}];
	let res = unpackSqlResult(SqlResult);
	console.log(res);

    SqlResult = [{id: 0, name: 'Marcus'}];
	res = unpackSqlResult(SqlResult);
	console.log(res);

	SqlResult =  [{name: 'Marcus'}];
	res = unpackSqlResult(SqlResult);
	console.log(res);

	SqlResult =  [{}];
	res = unpackSqlResult(SqlResult);
	console.log(res);

    //connectToSQLdb();
};
