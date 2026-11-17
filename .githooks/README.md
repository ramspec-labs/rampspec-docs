# Repository hooks

Enable the tracked hooks once after cloning:

```sh
git config core.hooksPath .githooks
```

The pre-commit hook runs the dependency-free malware indicator scan before a
commit is created. It does not install packages or execute project build code.
