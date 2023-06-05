---
title: "Build your date time parser in Elixir"
date: 2021-12-11
tags: ["elixir", "parser"]
author: Dung Nguyen
image: "/images/posts/datetime-parser.png"
draft: false
---

Elixir does not have built-in date time parser function. In this post, I will show you how to create one using regex.
The idea is: 

![datetime parser flow](/img/datetime-parser-flow.png)

1. Define a format string
2. Build regex pattern from format string
3. Compile datetime string with regex pattern
4. Build datetime struct from extracted parts.

And we will have something like this:

```elixir
Toolkit.DateTimeHelper.parse("18/12/21", "%d/%m/%y")
#> {:ok, ~U[2021-12-18 00:00:00Z]}
```


## 1. Define format string.

For simplicity, we support some basic format using convention from `Calendar.strftime`

| format | description     | value example           |
| --     | --              | --                      |
| H      | 24 hour         | 00 - 23                 |
| I      | 12 hour         | 00 - 12                 |
| M      | minute          | 00 - 59                 |
| S      | second          | 00 - 59                 |
| d      | day             | 01 - 31                 |
| m      | month           | 01 -12                  |
| y      | 2 digits year   | 00 - 99                 |
| Y      | 4 digits year   |                         |
| z      | timezone offset | +0100, -0330            |
| Z      | timezone name   | UTC+7, Asia/Ho_Chi_Minh |
| p      | PM or AM        |                         |
| P      | pm or am        |                         |


```elixir
defmodule DateTimeParser do
    @mapping %{
    "H" => "(?<hour>\\d{2})",
    "I" => "(?<hour12>\\d{2})",
    "M" => "(?<minute>\\d{2})",
    "S" => "(?<second>\\d{2})",
    "d" => "(?<day>\\d{2})",
    "m" => "(?<month>\\d{2})",
    "y" => "(?<year2>\\d{2})",
    "Y" => "(?<year>-?\\d{4})",
    "z" => "(?<tz>[+-]?\\d{4})",
    "Z" => "(?<tz_name>[a-zA-Z_\/]+)",
    "p" => "(?<p>PM|AM)",
    "P" => "(?<P>pm|am)",
    "%" => "%"
  }
end
```

Here we define a mapping between format character and regex pattern. In the pattern we using named capture to assign name to matched content. This will help us handle datetime parts easier.

## 2. Build regex pattern from format string

```elixir
def build_regex(format) do
  keys = Map.keys(@mapping) |> Enum.join("")

  Regex.compile!("([^%]*)%([#{keys}])([^%]*)")
  |> Regex.scan(format)
  |> Enum.map(fn [_, s1, key, s2] ->
    [s1, Map.get(@mapping, key), s2]
  end)
  |> to_string()
  |> Regex.compile!()
end
```

Here we scan for all string that start with `%` and followed by any of our format character which defined above. 
And then for each matching, we do replace the format with appropriate regex string.
Finally we compile it to a regex struct.

## 3. Capture all required parts
This is the easiest part. Regex do this for us.

```elixir
def parse(dt_string, format \\ "%Y-%m-%dT%H:%M:%SZ") do
  format
  |> build_regex
  |> Regex.named_captures(dt_string)
  |> cast_data()
  |> to_datetime()
end
```
`cast_data` and `to_datetime` are defined right belows, don't worry.


## 4. Build datetime struct from captured parts
This is the heavy part, we do it in 2 steps:
1. Cast and validate data
2. Build datetime struct

### 4.1 Cast and validate data

First we define some default values.
```elixir
@default_value %{
    day: 1,
    month: 1,
    year: 0,
    hour: 0,
    minute: 0,
    second: 0,
    utc_offset: 0,
    tz_name: "UTC",
    shift: "AM"
}
```

Then for each captured parts, we cast and validate each one until completed or got an error.

```elixir
def cast_data(nil), do: {:error, "invalid datetime"}

def cast_data(captures) do
    captures
    |> Enum.reduce_while([], fn {part, value}, acc ->
      case cast(part, value) do
        {:ok, data} -> {:cont, [data | acc]}
        {:error, _} = error -> {:halt, error}
      end
    end)
    |> case do
      {:error, _} = error -> error
      data -> Enum.into(data, @default_value)
    end
end
```

For each part we have different validation and logics. 
For part of days, we do upcase to make them same value so we handle them same way later:

```elixir
  defp cast("P", value) do
    cast("p", String.upcase(value))
  end

  defp cast("p", value) do
    {:ok, {:shift, value}}
  end
```

For timezone offset, we calculate `:utc_offset` in second. For timezone name, we keep it as is.

```elixir
  defp cast("tz", value) do
    {hour, minute} = String.split_at(value, 3)

    with {:ok, {_, hour}} <- cast("offset_h", hour),
         {:ok, {_, minute}} <- cast("offset_m", minute) do
      sign = div(hour, abs(hour))
      {:ok, {:utc_offset, sign * (abs(hour) * 3600 + minute * 60)}}
    else
      _ -> {:error, "#{value} is invalid timezone offset"}
    end
  end

  defp cast("tz_name", value) do
    {:ok, {:tz_name, value}}
  end
```

For other parts, we convert to integer and check against valid range.
Let's define some validation ranges:

```elixir
  @value_rages %{
    "hour" => [0, 23],
    "hour12" => [0, 12],
    "minute" => [0, 59],
    "second" => [0, 59],
    "day" => [0, 31],
    "month" => [1, 12],
    "year2" => [0, 99]
  }

  defp cast(part, value) do
    value = String.to_integer(value)

    valid =
      case Map.get(@value_rages, part) do
        [min, max] ->
          value >= min and value <= max

        _ ->
          true
      end

    if valid do
      {:ok, {String.to_atom(part), value}}
    else
      {:error, "#{value} is not a valid #{part}"}
    end
  end
```

### 4.2 Combine those all parts

For year with 2 digits, get 2 first digits of current year to make 4 digits year.
```elixir
  defp to_datetime({:error, _} = error), do: error

  defp to_datetime(%{year2: value} = data) do
    current_year = DateTime.utc_now() |> Map.get(:year)
    year = div(current_year, 100) * 100 + value

    data
    |> Map.put(:year, year)
    |> Map.delete(:year2)
    |> to_datetime()
  end
```

For 12 hours format, we convert to 24 hours.
```elixir
  defp to_datetime(%{hour12: hour} = data) do
    # 12AM is not valid

    if hour == 12 and data.shift == "AM" do
      {:error, "12AM is invalid value"}
    else
      hour =
        cond do
          hour == 12 and data.shift == "PM" -> hour
          data.shift == "AM" -> hour
          data.shift == "PM" -> hour + 12
        end

      data
      |> Map.put(:hour, hour)
      |> Map.delete(:hour12)
      |> to_datetime()
    end
  end
```

After handling special cases, we build `Date`, `Time` and combine them into `DateTime` struct and handle time zone name.

```elixir
  defp to_datetime(data) do
    with {:ok, date} <- Date.new(data.year, data.month, data.day),
         {:ok, time} <- Time.new(data.hour, data.minute, data.second),
         {:ok, datetime} <- DateTime.new(date, time) do
      datetime = DateTime.add(datetime, -data.utc_offset, :second)

      if data.tz_name != "UTC" do
        DateTime.shift_zone(datetime, data.tz_name)
      else
        {:ok, datetime}
      end
    end
  end
```

## Conclusion

There are many way to build datetime parser, but using regex, in my opinion, is simplest way and easiest to understand. You can build it yourself and add some more format, no need to add another dependency to your library.

You can see the fullsource code here on [gist](https://gist.github.com/bluzky/62a20cdb57b17f47c67261c10aa3da8b).

If you have any feedback or suggestion, leave me a comment.
Thanks for reading.
