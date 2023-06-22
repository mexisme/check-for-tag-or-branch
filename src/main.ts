import * as core from '@actions/core';
import * as github from '@actions/github';
import {RequestError} from '@octokit/request-error';

type RefType = 'tag' | 'branch';

class FindRef {
  readonly githubToken: string;
  readonly octokit;
  readonly owner: string;
  readonly repo: string;

  constructor(token: string) {
    this.githubToken = token;
    this.octokit = github.getOctokit(this.githubToken);
    ({owner: this.owner, repo: this.repo} = github.context.repo);
  }

  #refPrefix(refType: RefType): String {
    const refPrefix: {[id: string]: string} = {
      tag: 'tags/',
      branch: 'heads/',
    };

    return refPrefix[refType as string];
  }

  async find(refType: RefType, ref: String): Promise<boolean> {
    const refPrefix = this.#refPrefix(refType);

    try {
      core.debug(`Searching for ${refType} '${ref}'`);

      await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `${refPrefix}/${ref}`,
      });
    } catch (error) {
      if (error instanceof Error) core.debug(`error = ${error.message}`);
      core.debug(
        `error.type = ${typeof error} (RequestError = ${typeof RequestError})`
      );

      if (error instanceof RequestError) {
        core.debug(`error.status = ${error.status}`);

        if (error.status === 200) {
          core.debug(`Matching ${refType} was found`);
          return true;
        } else if (error.status === 404) {
          core.debug('Matching ${refType} was not found');
        } else {
          core.debug(`Unexpected request error = '${error}'`)
          throw error;
        }
      } else {
        core.debug(`Unexpected error = '${error}'`);
        throw error;
      }
    }

    return false;
  }
}

async function run(): Promise<void> {
  try {
    const findRef = new FindRef(core.getInput('github_token'));

    const gitTag: string = core.getInput('tag');
    const gitBranch: string = core.getInput('branch');
    const errorIfFound: boolean = core.getBooleanInput('errorIfFound');

    const found: String[] = [];

    if (gitTag !== null && gitTag !== '' && await findRef.find('tag', gitTag))
      found.push('TAG');
    if (
      gitBranch !== null &&
      gitBranch !== '' &&
      await findRef.find('branch', gitBranch)
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
