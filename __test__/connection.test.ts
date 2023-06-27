import {FindRef} from '../src/find-ref';

const GITHUB_TOKEN: string = process.env.GITHUB_TOKEN as string;

describe('integration tests: ', () => {
  if (GITHUB_TOKEN === '') {
    console.log(
      'Skipping integration tests, as $GITHUB_TOKEN was not provided.'
    );
    it.skip('SKIPPING INTEGRATION TESTS', () => {});
  } else {
    describe('when looking for a ref', () => {
      const gitRef = {
        tag: 'v1.0',
        branch: 'develop',
      };

      it(`can find tag "${gitRef.tag}"`, async () => {
        const fr = new FindRef(GITHUB_TOKEN);
        const result = await fr.find('tag', gitRef.tag);
        expect(result).toBe(true);
      });

      it(`can find branch "${gitRef.branch}"`, async () => {
        const fr = new FindRef(GITHUB_TOKEN);
        const result = await fr.find('branch', gitRef.branch);
        expect(result).toBe(true);
      });
    });
  }
});
