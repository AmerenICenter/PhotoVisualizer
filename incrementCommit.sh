rm src/titleIncrementer.js;
echo "document.title = \"Commit $1 \";" > src/titleIncrementer.js;
git add src/titleIncrementer.js;
echo "Commit number $1";
git commit -a -m "test commit number $1";
git push -u --force
