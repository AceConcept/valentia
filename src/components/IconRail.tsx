"use client";

const ICON_BASE = "/Sidebar Icons";

const ITEMS: { file: string; label: string }[] = [
  { file: "auto_mode.svg", label: "Auto mode" },
  { file: "Bookmark.svg", label: "Bookmarks" },
  { file: "browse_gallery.svg", label: "Browse gallery" },
  { file: "candlestick_duotone_line.svg", label: "Candlesticks" },
  { file: "data_object.svg", label: "Data" },
  { file: "horizontal_split.svg", label: "Split view" },
  { file: "keyboard_command_key.svg", label: "Command" },
  { file: "mode_standby.svg", label: "Standby" },
  { file: "Setting_line.svg", label: "Settings" },
  { file: "share_location.svg", label: "Share location" },
  { file: "Status.svg", label: "Status" },
  { file: "storage.svg", label: "Storage" },
];

const RAIL_MAIN_ITEMS = ITEMS.slice(0, -2);
const RAIL_BOTTOM_ITEMS = ITEMS.slice(-2);

function iconSrc(file: string): string {
  return encodeURI(`${ICON_BASE}/${file}`);
}

const RAIL_ICON_BTN =
  "group flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-[0.5rem] text-foreground transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-v-hover hover:shadow-[inset_0_0_0_0.0625rem_var(--v-border)] active:scale-[0.98] focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted";

function RailTriangleLogo() {
  return (
    <div
      className="flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center text-v-subtle"
      role="img"
      aria-label="Valentia"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0"
        aria-hidden
      >
        <path d="M12 5.2L20.2 19.8H3.8L12 5.2z" />
      </svg>
    </div>
  );
}

function RailIconButton(
  props: { label: string; file: string } | { label: string; src: string },
) {
  const resolvedSrc =
    "src" in props ? encodeURI(props.src) : iconSrc(props.file);
  return (
    <button
      type="button"
      title={props.label}
      aria-label={props.label}
      className={RAIL_ICON_BTN}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVGs from /public */}
      <img
        src={resolvedSrc}
        alt=""
        draggable={false}
        className="pointer-events-none h-[2.25rem] w-[2.25rem] select-none object-contain opacity-80 transition-[opacity,filter,transform] duration-200 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:brightness-110"
      />
    </button>
  );
}

export function IconRail() {
  return (
    <nav
      className="flex min-h-0 h-full w-[6.75rem] shrink-0 flex-col self-stretch overflow-hidden border-r-[0.0625rem] border-v-border bg-background [contain:layout]"
      aria-label="Primary tools"
    >
      <div className="flex shrink-0 flex-col items-center border-b-[0.0625rem] border-v-border px-[1rem] pb-[0.75rem] pt-[1rem]">
        <RailTriangleLogo />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex w-full min-h-0 flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full flex-col items-center gap-[1.25rem] py-[0.75rem]">
            {RAIL_MAIN_ITEMS.map(({ file, label }) => (
              <RailIconButton key={file} file={file} label={label} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-[1.25rem] border-t-[0.0625rem] border-v-border py-[1rem]">
        {RAIL_BOTTOM_ITEMS.map(({ file, label }) => (
          <RailIconButton key={file} file={file} label={label} />
        ))}
        <RailIconButton
          key="expand-right-stop"
          src="/MISC/Expand_right_stop.svg"
          label="Expand right"
        />
      </div>
    </nav>
  );
}
