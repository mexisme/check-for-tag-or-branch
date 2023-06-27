import * as core from '@actions/core';
import * as github from '@actions/github';
import {RequestError} from '@octokit/request-error';

function isRequestError(error: any): error is RequestError {
  const _error = error as RequestError;

  return _error.status !== undefined && _error.request !== undefined;
}

export type RefType = 'tag' | 'branch';

export class FindRef {
  readonly githubToken: string;
  readonly octokit;
  readonly owner: string;
  readonly repo: string;

  constructor(token: string) {
    this.githubToken = token;
    this.octokit = github.getOctokit(this.githubToken);
    ({owner: this.owner, repo: this.repo} = github.context.repo);
  }

  refPrefix(refType: RefType): String {
    const _refType: string = refType as string;
    const refPrefix: {[id: string]: string} = {
      tag: 'tags/',
      branch: 'heads/',
    };

    return refPrefix[_refType];
  }

  ref(refType: RefType, ref: String): string {
    const refPrefix = this.refPrefix(refType);
    const _ref = `${refPrefix}${ref}`;

    core.debug(`Looking for ref = "${_ref}"`);

    return _ref;
  }

  async find(refType: RefType, ref: String): Promise<boolean> {
    try {
      core.debug(
        `Searching for ${refType} "${ref}" in ${this.owner} / ${this.repo}`
      );

      await this.octokit.rest.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: this.ref(refType, ref),
      });
    } catch (error) {
      if (isRequestError(error)) {
        core.debug(`error.status = "${error.status}"`);

        if (error.status === 404) {
          core.debug(`Matching "${refType}" "${ref}" was not found`);
          return false;
        } else {
          core.debug(`Unexpected request error = "${error}"`);
          throw error;
        }
      } else {
        core.debug(`Unexpected error = "${error}"`);
        if (error instanceof Error) core.debug(error.stack as string);
        throw error;
      }
    }

    core.debug(`Matching "${refType}" "${ref}" was found`);
    return true;
  }
}
