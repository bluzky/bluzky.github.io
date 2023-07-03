---
title: Spacemacs - Configure format-on-save for Elixir 
date:
  2023-07-03
author: Dung Nguyen
tags:
  - others
  - elixir
  - til
draft: false
image: ''
categories:
  - elixir
---
Recently I've used `elixir-ts-mode` for elixir on Spacemacs. It provides better `.heex` code higlighting. Suddenly, my code was not formatted when I saved the buffer.

What's the heck happening?

When I disabled `elixir-ts-mode`, `format-on-save` hook worked again. Then I've struggled for half a day to find a working solution. After trying so many instructions online, this is how I configure spacemacs to format code on save:

```lisp
  ;; this generate functions
  ;; elixir-format
  ;; elixir-format-buffer
  ;; elixir-format-region
  ;; elixir-format-on-save-mode
  (reformatter-define elixir-format
    :program "mix"
    :args '("format" "-"))

  (add-hook 'elixir-mode-hook 'elixir-ts-mode)
  (add-hook 'elixir-ts-mode-hook 'elixir-format-on-save-mode)
```

**Notes: **You have to add `reformatter` to your `additional-packages` list.
