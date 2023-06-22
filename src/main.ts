import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const {owner, repo} = github.context.repo;
    const octokit = github.getOctokit(core.getInput('github_token'));

    const gitTag: string = core.getInput('tag');
    const gitBranch: string = core.getInput('branch');
    const errorIfFound: boolean = core.getBooleanInput('errorIfFound');

    const found: String[] = [];

    if (gitTag !== null && gitTag !== '') {
      core.debug(`Searching for tag ${gitTag}`);

      const response = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `tags/${gitTag}`,
      });

      if (response.status === 200) {
        core.debug('Matching Tag was found');
        found.push('TAG');
      }
    }

    if (gitBranch !== null && gitBranch !== '') {
      core.debug(`Searching for branch ${gitBranch}`);
      const response = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${gitBranch}`,
      });

      if (response.status === 200) {
        core.debug('Matching Branch was found');
        found.push('BRANCH');
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
