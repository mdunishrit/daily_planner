# Command Board — design notes

Keep every slice consistent with this list.

## Colours

Use Tailwind tokens only. No raw hex.

- Page background: `bg-bg`. Rail, navigator, header, modal: `bg-surface`. Cards: `bg-card`.
- Borders: `border-line`. Primary text: `text-ink`. Secondary text: `text-muted`.
- Active or selected state: `bg-accent-soft text-accent`. Hover on quiet items: `hover:text-ink`.
- Header is translucent: `bg-surface/90 backdrop-blur`.
- Modal scrim: `bg-black/30 backdrop-blur-sm`.
- Priority square: high `bg-accent`, normal `bg-muted/50`, low `bg-line`.
- Status dot: todo `bg-muted`, in_progress `bg-accent`, done `bg-line`.

## Layout sizes

- Rail: `w-14` (56px), `border-r border-line`, `py-4`, icons `p-2 rounded-lg`, 18px icon stroke 1.8.
- Navigator: `w-60` (240px), `px-3 py-5`, visible at `lg:` only.
- Header: `px-6 py-3`, sticky `top-0 z-20`, height near 48px. Column headings stick at `top-14`.
- Content padding: `px-6 py-6`. Board grid: `grid-cols-1 md:grid-cols-3 gap-8`.
- Modal: `max-w-2xl`, grid `md:grid-cols-[1.4fr_1fr]`, padding `p-6`, header strip `px-6 py-3`.

## Type scale

- Card and list rows, navigator items, search: `text-[13px]`.
- Section labels and column headings: `text-[12px] font-medium uppercase tracking-[0.1em] text-muted`.
- Navigator group labels and modal meta: `text-[11px] uppercase tracking-[0.12em] text-muted`.
- Avatar initials: `text-[9px]`. Counts use `tabular-nums`.
- Modal title: `text-xl font-semibold leading-snug`.

## Density

- Board card: `px-3 py-3 gap-2.5 rounded-lg border border-line`.
- List row: `px-1 py-2.5 gap-3 border-b border-line`, no card background.
- Navigator item: `px-2 py-1.5 rounded-lg`, list spacing `space-y-0.5`.

## Components

- Ring: 16x16 SVG, r=6, strokeWidth 2, rotated -90, `text-accent` arc over 0.2 opacity track. Hidden when total is 0.
- Avatars: `h-5 w-5 rounded-full bg-accent-soft text-accent`, overlap `-space-x-1.5`, maximum 3 shown.
- Quick add: borderless input, `hover:border-line focus:border-accent`, placeholder `+  New card`.

## Motion

One shared token: `transition-all duration-150`. Card hover: `-translate-y-px`, `border-accent`, `shadow-card`. Card press: `active:scale-[0.99]`.
