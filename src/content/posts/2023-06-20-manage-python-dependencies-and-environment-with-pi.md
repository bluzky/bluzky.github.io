---
title: Manage python dependencies and environment with Pipenv
date:
  2023-06-20
author: Dung Nguyen
tags:
  - python
  - til
  - short
draft: true
image: ''
---
## Why

- Automatically install required Pythons, if `pyenv` or `asdf` is available

- Automatically loads `.env` files, if they exist.

- Automatically creates a virtualenv in a standard location.

- Automatically adds/removes packages to a `Pipfile` when they are installed/uninstalled.

## Install

- `brew install pipenv`

## Basic command

- `pipenv --python <version>` setup project for specific python version

- `pipenv install [--dev] <package>` install a package. `--dev` -> only used in development.

- `pipenv run <command>` run a command inside virtual environment

  - Ex: `pipenv run python -m pytest`

- `pipenv shell` activate virtual env

    - `exit` to deactivate virtualenv

- `pipenv graph` show dependency graph

- `pipenv lock` generate Pipfile.lock

- `pipenv requirements > requirements.txt` generate `requirements.txt`

- `pipenv sync` install all packages specified in Pipfile.lock
