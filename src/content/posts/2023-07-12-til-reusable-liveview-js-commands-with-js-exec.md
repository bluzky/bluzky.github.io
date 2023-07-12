---
title: '[TIL] Reusable LiveView.JS commands with JS.exec'
date:
  2023-07-12
author: Dung Nguyen
tags:
  - tech
  - elixir
  - phoenix
draft: true
image: /images/posts/til.png
categories:
  - elixir
  - phoenix
---


In this post I will build a simple dropdown for demo purpose. Not fully functional as a real dropdown :D.

## 1. Duplicated code

```elixir
<div
  class="relative inline-block m-10"
  id="my-dropdown"
  phx-mounted={@open && (JS.show(to: "#my-dropdown .dropdown-content") |> JS.add_class("bg-blue-300", to: "#my-dropdown .dropdown-btn"))}
>
  <div
    class="dropdown-btn border border-gray-100 px-4 py-2 rounded-lg bg-gray-700 text-white inline-block cursor-pointer"
    phx-click={JS.show(to: "#my-dropdown .dropdown-content") |> JS.add_class("bg-blue-300", to: "#my-dropdown .dropdown-btn")}
  >
    Toggle button
  </div>
  <div class="dropdown-content absolute hidden bottom-0 left-0 translate-y-full w-[275px] bg-slate-50 rounded-lg border border-slate-200 shadow-md py-5">
    <div class="border-b hover:bg-slate-100 px-5 py-2">Item 1</div>
    <div class="border-b hover:bg-slate-100 px-5 py-2">Item 2</div>
    <div class="border-b hover:bg-slate-100 px-5 py-2">Item 3</div>
    <div class="border-b hover:bg-slate-100 px-5 py-2">Item 4</div>
    <div class="border-b hover:bg-slate-100 px-5 py-2">Item 5</div>
  </div>
</div>
```



## 2. Writing a function

To avoid duplicated `JS` code, you can write a function in LiveView component

```elixir
def open_dropdown(id) do
    [to: "##{id} .dropdown-content"]
    |> JS.show()
    |> JS.add_class("bg-blue-300", to: "##{id} .dropdown-btn")
end
```

and update your template

```html
<div
  class="relative inline-block m-10"
  id="my-dropdown"
  phx-mounted={@open && open_dropdown("my-dropdown")}
>
  <div
    class="dropdown-btn border border-gray-100 px-4 py-2 rounded-lg bg-gray-700 text-white inline-block cursor-pointer"
    phx-click={open_dropdown("my-dropdown")}
  >
    Toggle button
  </div>
  <div class="dropdown-content absolute hidden bottom-0 left-0 translate-y-full w-[275px] bg-slate-50 rounded-lg border border-slate-200 shadow-md py-5">
    <!-- Your dropdown content -->
  </div>
</div>
```

This way you write code in 2 separated modules and you have to switch between them to understand how it works.

## 3. Reuse code with  `JS.exec`

`JS.exec`'s document says:

> Executes JS commands located in element attributes.

The followed example make me think that it only support some special attributes like `phx-remote` and `phx-*` attributes. Recently I found that it could be any attribute name.

The example above can be rewrite:

```html
<div
  class="relative inline-block m-10"
  id="my-dropdown"
  action-open-dropdown={
    JS.show(to: "#my-dropdown .dropdown-content")
    |> JS.add_class("bg-blue-300", to: "#my-dropdown .dropdown-btn")
  }
  phx-mounted={@open && JS.exec("action-open-dropdown")}
>
  <div
    class="dropdown-btn border border-gray-100 px-4 py-2 rounded-lg bg-gray-700 text-white inline-block cursor-pointer"
    phx-click={JS.exec("action-open-dropdown", to: "#my-dropdown")}
  >
    Toggle button
  </div>
  <div class="dropdown-content absolute hidden bottom-0 left-0 translate-y-full w-[275px] bg-slate-50 rounded-lg border border-slate-200 shadow-md py-5">
    <!-- Your dropdown content -->
  </div>
</div>
```

This way you don't have to switch between files to get full implementation logic.


