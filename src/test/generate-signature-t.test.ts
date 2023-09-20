import { describe, it, expect, test, jest } from '@jest/globals';
import handler from '../api/generate-signature';
import { config } from 'dotenv';

config();

describe("Signature generatin Api test", () => {
    test('returns signature when valid data is provided', async () => {

        const req = {
            body: JSON.stringify({
                name: 'Song Title',
                description: 'NFT for a song',
                coverImage: 'https://example.com/cover.jpg',
                music: 'https://example.com/music.mp3',
                address: '0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C',
                quantity: 1,
            })
        }

        const json = jest.fn();

        const status = jest.fn(() => {
            return {
                json
            }
        })

        const res = {
            status
        }

        // @ts-ignore
        await handler(req, res)

        // @ts-ignore
        //console.log('\n\nsignature:\n', json.mock.calls[0][0].signature)
        expect(json.mock.calls[0][0]).toHaveProperty("signature");

    }, 10000);

    test('returns error when empty request is sent', async () => {

        const req = {
            body: JSON.stringify({})
        }

        const json = jest.fn();

        const status = jest.fn(() => {
            return {
                json
            }
        })

        const res = {
            status
        }

        // @ts-ignore
        await handler(req, res)

        // @ts-ignore
        expect(json.mock.calls[0][0]).toHaveProperty("error");

    }, 10000);


});

