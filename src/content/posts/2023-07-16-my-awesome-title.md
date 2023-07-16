---
title: Tailwind merge for Phoenix / Elixir
date: 2023-07-16
author: Dzung Nguyen
tags:
  - tech
  - elixir
  - til
  - phoenix
draft: false
image: ''
categories:
  - elixir
  - phoenix
description: ''
---
## Problem

I am working on an open source project [OrangeCMS](https://github.com/bluzky/orangecms/) using Phoenix LiveView. I am building some reusable components which supports custom class. But many time custom class conflict with default class and I didn't get expected result.

**For example:**

```elixir
attr :class, :string, default: nil
slot :inner_block, required: true
def my_component(assigns) do
  ~H"""
   <div class={["bg-green-500", @class]}>
    <%= render_slot(@inner_block) %>
   </div>
  """
end
```

and use it

`<.my_component class="bg-red-500"> HELLO </.my_component>`

The result is not `red-500` as you might expected.



## Solution

I searched for a solution, and I found [tailwind-merge](https://github.com/dcastil/tailwind-merge) which is written in JavaScript. Basically it finds conflicted classes and resolve the conflict. For example:

```javascript
twMerge('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

I was thinking of porting this library to Elixir. But first, I searched on [hex.pm](http://hex.pm) and Surprising. I found two packages that support merging tailwind classes: [twix](https://hex.pm/packages/twix) and [tails](https://hex.pm/packages/tails) 

First, I try Twix but it doesn't support custom color classes and raise exception.

Then I try Tails , and with some little configuration, it works perfectly.

1. Add Tails to your dependencies

`{:tails, "~> 0.1.5"}`

2. Add custom `colors.json` files to `/assets/` or `/priv` directory

```json
{
  "primary": "orange",
  "secondary": "green"
}
```

3. Add Tails config

```elixir
config :tails, colors_file: Path.join(File.cwd!(), "assets/colors.json")
```

4. Update code

Wrap class list with `Tails.classes`

`class={Tails.classes(["bg-green-500", @class])}`

```elixir
attr :class, :string, default: nil
slot :inner_block, required: true
def my_component(assigns) do
  ~H"""
   <div class={Tails.classes(["bg-green-500", @class])}>
    <%= render_slot(@inner_block) %>
   </div>
  """
end
```



## Conclusion

Thank to **Zach Daniel **, it's now easier for us to resolve tailwind class conflict in Elixir. And before roll out my own solution, I should take a second to search on [Hex.pm](http://Hex.pm) , it's amazing that most of what I need was already implemented by Elixir community. Send my regards to all of those who spend their precious hours to make my life easier.
