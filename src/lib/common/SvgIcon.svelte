<script lang="ts">
  import { getContext } from "svelte"
  import { twMerge } from "tailwind-merge"

  type Context = {
    size?: string
    role?: string
    color?: string
    withEvents?: boolean
    path?: string
  }
  type Size = "xs" | "sm" | "md" | "lg" | "xl"

  const ctx:Context = getContext("iconCtx") ?? {}
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  }
  export let path = ctx.path || "M 3 3V 21H 21V 3"
  export let size:Size = ctx.size as Size || "md";
  export let role = ctx.role || "img";
  export let color = ctx.color || "currentColor";
  export let withEvents = ctx.withEvents || false;
  export let name = "svg-icon";
</script>

{#if withEvents}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
    {...$$restProps}
    class={twMerge('shrink-0', sizes[size], $$props.class)}
    {role}
    aria-label={name}
    aria-describedby={undefined}
    viewBox="0 0 24 24"
    on:click
    on:keydown
    on:keyup
    on:focus
    on:blur
    on:mouseenter
    on:mouseleave
    on:mouseover
    on:mouseout
  >
    <path
      fill-rule="evenodd"
      d="M7 2a2 2 0 0 0-2 2v1a1 1 0 0 0 0 2v1a1 1 0 0 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm3 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-1 7a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3 1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1Z"
      clip-rule="evenodd"
    />
  </svg>
{:else}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={color}
    {...$$restProps}
    class={twMerge('shrink-0', sizes[size], $$props.class)}
    {role}
    aria-label={name}
    aria-describedby={undefined}
    viewBox="0 0 24 24"
  >
    <path
      fill-rule="evenodd"
      d={path}
      clip-rule="evenodd"
    />
  </svg>
{/if}
