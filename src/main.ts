import * as core from '@actions/core';
import {FindRef} from './find-ref';

async function run(): Promise<void> {
  try {
    const findRef = new FindRef(core.getInput('github_token'));

    const gitTag: string = core.getInput('tag');
    const gitBranch: string = core.getInput('branch');
    const errorIfFound: boolean = core.getBooleanInput('errorIfFound');

    const found: String[] = [];

    if (gitTag !== null && gitTag !== '' && (await findRef.find('tag', gitTag)))
      found.push('TAG');
    if (
      gitBranch !== null &&
      gitBranch !== '' &&
      (await findRef.find('branch', gitBranch))
    )
      found.push('BRANCH');

    const foundList = found.join(', ');
    core.setOutput('found', foundList);
    if (errorIfFound && found.length > 0)
      throw new Error(`Matching refs found: ${foundList}`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
