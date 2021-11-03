/**
 * External dependencies
 */
const { resolve } = require( 'path' );
const glob = require( 'fast-glob' );
const fs = require( 'fs' );
const { keys, pickBy } = require( 'lodash' );
/**
 * Path to root project directory.
 *
 * @type {string}
 */
const ROOT_DIR = resolve( __dirname, '../..' );

/**
 * Path to packages directory.
 *
 * @type {string}
 */
const BLOCK_LIBRARY_DIR = resolve( ROOT_DIR, 'packages/block-library/src' );

/**
 * Path to docs file.
 *
 * @type {string}
 */
const BLOCK_LIBRARY_DOCS_FILE = resolve(
	ROOT_DIR,
	'docs/reference-guides/core-blocks.md'
);

/**
 * Start token for matching string in doc file.
 *
 * @type {string}
 */
const START_TOKEN = '<!-- START Autogenerated - DO NOT EDIT -->';

/**
 * Start token for matching string in doc file.
 *
 * @type {string}
 */
const END_TOKEN = '<!-- END Autogenerated - DO NOT EDIT -->';

/**
 * Regular expression using tokens for matching in doc file.
 * Note: `.` does not match new lines, so [^] is used.
 *
 * @type {RegExp}
 */
const TOKEN_PATTERN = new RegExp( START_TOKEN + '[^]*' + END_TOKEN );

/**
 * Uses lodash keys and pickby to get keys with truthy values,
 * filtering out any experimental keys.
 *
 * @type {Object} obj
 * @return {string[]} Array of truthy keys
 */
function getTruthyKeys( obj ) {
	return keys( pickBy( obj ) ).filter(
		( key ) => ! key.startsWith( '__exp' )
	);
}

/**
 * Process list of object that may contain inner keys.
 * For example: spacing( margin, padding ).
 *
 * @param {Object} obj
 * @return {string[]} Array of keys (inner keys)
 */
function processObjWithInnerKeys( obj ) {
	const rtn = [];

	const kvs = getTruthyKeys( obj );

	kvs.forEach( ( key ) => {
		if ( Array.isArray( obj[ key ] ) ) {
			rtn.push( `${ key } (${ obj[ key ].sort().join( ', ' ) })` );
		} else if ( typeof obj[ key ] === 'object' ) {
			const innerKeys = getTruthyKeys( obj[ key ] );
			rtn.push( `${ key } (${ innerKeys.sort().join( ', ' ) })` );
		} else {
			rtn.push( key );
		}
	} );
	return rtn;
}

/**
 * Reads block.json file and returns markdown formatted entry.
 *
 * @param {string} filename
 *
 * @return {string} markdown
 */
function readBlockJSON( filename ) {
	const data = fs.readFileSync( filename, 'utf8' );
	const blockjson = JSON.parse( data );

	const supports = processObjWithInnerKeys( blockjson.supports );
	const attributes = getTruthyKeys( blockjson.attributes );

	return `
## ${ blockjson.title }

${ blockjson.description }

-	**Name:** ${ blockjson.name }
-	**Category:** ${ blockjson.category }
-	**Supports:** ${ supports.sort().join( ', ' ) }
-	**Attributes:** ${ attributes.sort().join( ', ' ) }
`;
}

// Generate block docs
const files = glob.sync( `${ BLOCK_LIBRARY_DIR }/*/block.json` );
let autogen = '';

files.forEach( ( file ) => {
	const markup = readBlockJSON( file );
	autogen += markup;
} );

let docsContent = fs.readFileSync( BLOCK_LIBRARY_DOCS_FILE, {
	encoding: 'utf8',
	flag: 'r',
} );

// Add delimiters back.
autogen = START_TOKEN + '\n' + autogen + '\n' + END_TOKEN;
docsContent = docsContent.replace( TOKEN_PATTERN, autogen );

// write back out
fs.writeFileSync( BLOCK_LIBRARY_DOCS_FILE, docsContent, { encoding: 'utf8' } );
