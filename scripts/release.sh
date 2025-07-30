#!/bin/bash

# Release script for Tar1090 Aircraft Tracker
# Usage: ./scripts/release.sh <version> <changelog_entry>

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <version> [changelog_entry]"
    echo "Example: $0 1.0.4 'Added new feature X'"
    exit 1
fi

VERSION=$1
CHANGELOG_ENTRY=${2:-"Version $VERSION release"}

echo "🚀 Preparing release $VERSION..."

# Update version in config.yaml
echo "📝 Updating version in config.yaml..."
sed -i.bak "s/version: \".*\"/version: \"$VERSION\"/" tar1090/config.yaml

# Update changelog if entry provided
if [ "$#" -gt 1 ]; then
    echo "📋 Updating CHANGELOG.md..."
    # Add new version section to changelog
    DATE=$(date +%Y-%m-%d)
    
    # Create temp file with new entry
    {
        head -n 6 CHANGELOG.md
        echo ""
        echo "## [$VERSION] - $DATE"
        echo ""
        echo "### Added"
        echo "- $CHANGELOG_ENTRY"
        echo ""
        tail -n +7 CHANGELOG.md
    } > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md
fi

# Git operations
echo "📦 Committing changes..."
git add .
git commit -m "🔖 Release version $VERSION

$CHANGELOG_ENTRY

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "🏷️  Creating git tag..."
git tag -a "v$VERSION" -m "Release version $VERSION"

echo "⬆️  Pushing to remote..."
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION completed!"
echo "🌐 Check: https://github.com/random-robbie/tar1090-tracker/releases"

# Clean up backup file
rm -f tar1090/config.yaml.bak