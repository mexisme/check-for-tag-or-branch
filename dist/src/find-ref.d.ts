export type RefType = 'tag' | 'branch';
export declare class FindRef {
    readonly githubToken: string;
    readonly octokit: import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
        paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
    };
    readonly owner: string;
    readonly repo: string;
    constructor(token: string);
    refPrefix(refType: RefType): String;
    ref(refType: RefType, ref: String): string;
    find(refType: RefType, ref: String): Promise<boolean>;
}
