/// <reference types="@types/testing-library__jest-dom" />

import matchers from '@testing-library/jest-dom/matchers';
import {expect} from 'vitest';
expect.extend(matchers);
