# Changesets

This project uses [changesets](https://github.com/changesets/changesets) for versioning and publishing.

## Adding a changeset

When you make a change that requires a version bump, run:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages should be bumped
2. Choose the bump type (patch, minor, major)
3. Write a summary of the changes

## Releasing

The release process is automated through GitHub Actions:

1. When PRs with changesets are merged to main, a "Version Packages" PR is created
2. When the "Version Packages" PR is merged, the packages are published to npm

## Manual release

If you need to release manually:

```bash
# Version packages based on changesets
pnpm version

# Build and publish
pnpm release
```
