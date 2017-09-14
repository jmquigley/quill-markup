/**
 *  Throwaway test helper functions that are shared between tests
 */

'use strict';

import {CallbackTestContext} from 'ava';
import * as fs from 'fs-extra';
import {Fixture} from 'util.fixture';

const pkg = require('../../package.json');

export function debug(message: string): void {
	if (pkg.debug) {
		console.log(message);
	}
}

export function cleanup(msg: string, t: CallbackTestContext): void {
	if (msg) {
		console.log(`final cleanup: ${msg}`);
	}

	Fixture.cleanup((err: Error, directories: string[]) => {
		if (err) {
			return t.fail(`Failure cleaning up after test: ${err.message}`);
		}

		directories.forEach((directory: string) => {
			t.false(fs.existsSync(directory));
		});

		t.end();
	});
}
