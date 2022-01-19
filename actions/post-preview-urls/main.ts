/**
 * Post the feature branch preview links to PR description
 */

import * as core from "@actions/core"
import * as github from "@actions/github"

import { getSanitizedBranchName, runAction } from "../utils"

runAction(async () => {
  const token = core.getInput("token", { required: true })
  const marker = core.getInput("marker", { required: true })
  const appDomain = core.getInput("app_domain", { required: true })
  const storiesDomain = core.getInput("stories_domain", { required: false })

  await postPreviewUrls({
    marker,
    appDomain,
    storiesDomain,
    token,
    context: github.context,
  })
})

interface PostPreviewUrlsActionArgs {
  token: string
  marker: string
  context: typeof github.context
  appDomain: string
  storiesDomain?: string
}

export async function postPreviewUrls({
  token,
  marker,
  context,
  appDomain,
  storiesDomain,
}: PostPreviewUrlsActionArgs) {
  const pr = context.payload.pull_request

  if (!pr) {
    throw new Error("Called outside of a PR context.")
  }

  if (pr?.body?.includes(marker)) {
    core.info(`PR already contains the link`)
    return
  }

  const octokit = github.getOctokit(token)
  const branchName = getSanitizedBranchName(pr.head.ref)
  const body = `${pr.body ?? ""}
  ${marker}
  ---
  🖥 **Latest app preview**: https://${branchName}.${appDomain}
  ${
    storiesDomain
      ? `📒 **Latest storybook preview**: https://${branchName}.${storiesDomain}`
      : ""
  }
  
  Preview deployment for each commit is available via "View Deployment" buttons.
  ❤, 🤖
  `

  await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
    ...context.repo,
    pull_number: pr.number,
    body,
  })
}
