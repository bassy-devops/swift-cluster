import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    cleanup();
});

const cryptoMock = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2)
};

if (typeof global.crypto === 'undefined') {
    Object.defineProperty(global, 'crypto', { value: cryptoMock, writable: true });
} else if (!global.crypto.randomUUID) {
    // @ts-ignore
    global.crypto.randomUUID = cryptoMock.randomUUID;
}
