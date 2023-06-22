import * as core from '@actions/core';
import * as github from '@actions/github';
import {RequestError} from '@octokit/request-error';

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo;
    const octokit = github.getOctokit(core.getInput('github_token'));

    const gitTag: string = core.getInput('tag');
    const gitBranch: string = core.getInput('branch');
    const errorIfFound: boolean = core.getBooleanInput('errorIfFound');

    const found: String[] = [];

    if (gitTag !== null && gitTag !== '') {
      try {
        core.debug(`Searching for tag ${gitTag}`);

        await octokit.rest.git.getRef({
          owner,
          repo,
          ref: `tags/${gitTag}`,
        });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === 200) {
            core.debug('Matching Tag was found');
            found.push('BRANCH');
          } else if (error.status === 404) {
            core.debug('Matching Tag was not found');
          } else throw error;
        } else throw error;
      }
    }

    if (gitBranch !== null && gitBranch !== '') {
      try {
        core.debug(`Searching for branch ${gitBranch}`);
        await octokit.rest.git.getRef({
          owner,
          repo,
          ref: `heads/${gitBranch}`,
        });
      } catch (error) {
        if (error instanceof RequestError) {
          if (error.status === 200) {
            core.debug('Matching Branch was found');
            found.push('BRANCH');
          } else if (error.status === 404) {
            core.debug('Matching Branch was not found');
          } else throw error;
        } else throw error;
      }
    }

    const foundList = found.join(', ');
    core.setOutput('found', foundList);
    if (errorIfFound && found.length > 0)
      throw new Error(`Matching refs found: ${foundList}`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
