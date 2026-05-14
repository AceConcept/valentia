const TAB_ICON_TOP_GAINERS = encodeURI("/crypto sidebar icons/top-gainers.svg");
const TAB_ICON_TRENDING = encodeURI("/crypto sidebar icons/grain.svg");

const ICON_BOX = "pointer-events-none absolute inset-0 h-full w-full object-contain";
const SWAP_IN =
  "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100";
const SWAP_OUT =
  "opacity-100 transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0";

/** Idle: star; hover/focus: up-arrow */
export function TopGainersTabLeadingIcon() {
  return (
    <span className="relative h-[1.5625rem] w-[1.5625rem] shrink-0">
      <svg
        className={`absolute inset-0 h-full w-full text-white ${SWAP_IN}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 19V6M7 11l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG from /public */}
      <img
        src={TAB_ICON_TOP_GAINERS}
        alt=""
        draggable={false}
        className={`${ICON_BOX} brightness-0 invert ${SWAP_OUT}`}
        aria-hidden
      />
    </span>
  );
}

/** Static grain “spark” icon (no hover swap). */
export function TrendingTabLeadingIcon() {
  return (
    <span className="relative h-[1.5625rem] w-[1.5625rem] shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG from /public */}
      <img
        src={TAB_ICON_TRENDING}
        alt=""
        draggable={false}
        className={`${ICON_BOX} brightness-0 invert`}
        aria-hidden
      />
    </span>
  );
}
