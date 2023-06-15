---
title: Manage python version with pyenv
date:
  2023-06-15
author: Dung Nguyen
tags:
  - python
  - til
  - short
  - python
  - til
draft: false
image: ''
---
## Install  `pyenv`  on MacOS

```
brew update
brew install pyenv

```

- **Update shell** `.bashrc` or `.zshrc` with following

```shell

		  export PYENV_ROOT="$HOME/.pyenv"

		  command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"

		  eval "$(pyenv init -)"

```

## How it work

Build from source on installation

## Basic commands

- `pyenv install <version>` install a python version
- Switch version
  - `pyenv shell <version>` select python version for current shell
  - `pyenv local <version>` automatically select whenever you are in the current directory (or its subdirectories)
  - `pyenv global <version>` select globally for your user account
  - set `system` as `<version>` -> use system provided python version
- `pyenv uninstall <version>` uninstall a python version
- `pyenv update` update pyenv


