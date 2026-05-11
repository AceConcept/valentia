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

function iconSrc(file: string): string {
  return encodeURI(`${ICON_BASE}/${file}`);
}

export function IconRail() {
  return (
    <nav
      className="flex min-h-0 w-[6.75rem] shrink-0 flex-col items-center gap-[0.5rem] self-stretch overflow-y-auto border-r-[0.0625rem] border-v-border bg-background py-[1rem] [contain:layout]"
      aria-label="Primary tools"
    >
      {ITEMS.map(({ file, label }) => (
        <button
          key={file}
          type="button"
          title={label}
          aria-label={label}
          className="group flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-[0.5rem] text-foreground transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-v-hover hover:shadow-[inset_0_0_0_0.0625rem_var(--v-border)] active:scale-[0.98] focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVGs from /public */}
          <img
            src={iconSrc(file)}
            alt=""
            draggable={false}
            className="pointer-events-none h-[2.25rem] w-[2.25rem] select-none object-contain opacity-80 transition-[opacity,filter,transform] duration-200 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:brightness-110"
          />
        </button>
      ))}
    </nav>
  );
}
