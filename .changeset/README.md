# Changesets

This directory contains changeset files that describe changes to the packages in this monorepo.

## Usage

To create a new changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Specify the type of change (major, minor, patch)
3. Write a summary of the changes

## Versioning

When you're ready to version packages:

```bash
pnpm version
```

This will:
1. Update package versions based on changesets
2. Update CHANGELOG.md files
3. Delete the processed changeset files

## Publishing

To publish all changed packages to npm:

```bash
pnpm release
```

This will:
1. Build all packages in production mode
2. Publish changed packages to npm
3. Create git tags for the new versions

For more information, see the [Changesets documentation](https://github.com/changesets/changesets).
