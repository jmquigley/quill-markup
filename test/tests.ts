'use strict';

import test from 'ava';
import {Highlight} from '../index';

test('Base empty test case', t => {
	const highlight = new Highlight();
	t.truthy(highlight);
});
