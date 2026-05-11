import { cryptoIconUrl } from "@/lib/tokens";

type Props = {
  iconSlug: string;
  /** Visible label for assistive tech when not decorative */
  label: string;
  className?: string;
};

export function CryptoIcon({ iconSlug, label, className }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote static CDN; avoids next/image remote config on Workers
    <img
      src={cryptoIconUrl(iconSlug)}
      alt=""
      aria-hidden
      title={label}
      draggable={false}
      loading="lazy"
      decoding="async"
      className={[
        "pointer-events-none shrink-0 select-none rounded-full object-contain ring-[0.0625rem] ring-v-border ring-inset",
        className ?? "",
      ].join(" ")}
      onError={(e) => {
        (e.target as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}
